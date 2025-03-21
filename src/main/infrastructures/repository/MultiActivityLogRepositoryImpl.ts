import { DataSource } from 'typeorm';
import { OPEN_READONLY } from 'sqlite3';
import moment from 'moment/moment';
import MultiActivityLogRepository from '../../domain/model/MultiActivityLogRepository';
import { WorldSearchResult } from '../../domain/model/dto/WorldSeatchResult';
import { UserSearchResult } from '../../domain/model/dto/UserSearchResult';
import { UserJoinCount, WorldJoinCount } from '../../../dto/ActivityLog';
import { UserLog } from '../../domain/model/dto/UserLog';
import { InstanceType } from '../../../dto/ActivityStatisticsData';

export default class MultiActivityLogRepositoryImpl
  implements MultiActivityLogRepository
{
  private async initializeDataSource(paths: string[]): Promise<DataSource> {
    // メインのDBを開く
    const dataSource = new DataSource({
      type: 'sqlite',
      database: paths[0],
      flags: OPEN_READONLY,
    });
    await dataSource.initialize();

    // 他のDBをアタッチ
    let unionQuery = '';
    for (let i = 1; i < paths.length; i += 1) {
      await dataSource.query(`ATTACH DATABASE "${paths[i]}" AS "db${i}"`);
      unionQuery += `UNION ALL SELECT * FROM db${i}.ActivityLogs `;
    }

    // 各DBのテーブルをまとめた一時テーブルを作成
    await dataSource.query(
      `CREATE
      TEMPORARY TABLE
      temporaryTable
      AS
      SELECT *
      FROM ActivityLogs ${unionQuery}`
    );
    await dataSource.query('CREATE INDEX tempIndex ON temporaryTable(ID)');

    return dataSource;
  }

  /**
   * DBから該当期間にログのあるユーザーを取得する
   * @param paths
   * @param from
   * @param to
   */
  public async getUserJoinLog(
    paths: string[],
    from: Date,
    to: Date
  ): Promise<UserLog[]> {
    const dataSource = await this.initializeDataSource(paths);

    // ユーザー取得
    const result: {
      ID: number;
      UserName: string;
      Timestamp: string;
    }[] = await dataSource.query(
      'SELECT MIN(ID), UserName, MIN(Timestamp) from temporaryTable WHERE ActivityType = 1 AND ? <= Timestamp AND Timestamp <= ? GROUP BY UserName ORDER BY MIN(Timestamp)',
      [
        moment(from).format('YYYY-MM-DD HH:mm:ss'),
        moment(to).format('YYYY-MM-DD HH:mm:ss'),
      ]
    );
    await dataSource.destroy();

    return result.map((user) => {
      return {
        logId: user.ID,
        userName: user.UserName,
        joinDate: moment(user.Timestamp).toDate(),
      } as UserLog;
    });
  }

  /**
   * 全ワールドJoinデータを取得
   * @param paths
   */
  async getAllJoinLog(paths: string[]): Promise<WorldSearchResult[]> {
    const dataSource = await this.initializeDataSource(paths);

    const result: {
      logId: number;
      joinDate: string;
      estimateLeftDate: string;
      instanceId: string;
      worldName: string;
    }[] = await dataSource.manager.query(`
      SELECT log.ID                         as logId,
             log.Timestamp                  as joinDate,
             log.WorldID                    as instanceId,
             log.WorldName                  as worldName,
             leftDateTable.leftLogId        as leftLogId,
             leftDateTable.estimateLeftDate as estimateLeftDate
      FROM temporaryTable log
             LEFT OUTER JOIN (SELECT a1.ID as     logId,
                                     a1.Timestamp joinDate,
                                     a2.ID        leftLogId,
                                     a2.Timestamp estimateLeftDate
                              FROM temporaryTable a1,
                                   temporaryTable a2
                              WHERE a1.ActivityType = 0
                                AND (a2.ID =
                                     (SELECT min(a3.ID)
                                      FROM temporaryTable a3
                                      WHERE a3.ID > a1.ID
                                        AND a3.ActivityType = 0))) leftDateTable
                             ON log.ID = leftDateTable.logId
      WHERE log.ActivityType = 0
      ORDER BY log.ID DESC;`);
    await dataSource.destroy();

    return result.map((item) => {
      return {
        logId: item.logId,
        joinDate: new Date(item.joinDate),
        estimateLeftDate:
          item.estimateLeftDate !== null
            ? new Date(item.estimateLeftDate)
            : new Date(),
        instanceId: item.instanceId,
        worldName: item.worldName,
      } as WorldSearchResult;
    });
  }

  /**
   * ワールド名からJoinログを検索する
   * @param paths
   * @param keywords
   * @param filter
   */
  async getJoinLogByWorldName(
    paths: string[],
    keywords: string[],
    filter?: {
      fromDate?: Date;
      toDate?: Date;
      fromTime?: Date;
      toTime?: Date;
      dayOfWeek?: number;
      instanceType?: InstanceType;
    }
  ): Promise<WorldSearchResult[]> {
    const dataSource = await this.initializeDataSource(paths);

    const filterClause = this.generateWhereClause(filter || {}, 'log');
    const keywordClause =
      keywords.length !== 0
        ? ` AND ${keywords.map(() => 'log.WorldName LIKE ?').join(' AND ')}`
        : '';

    const result: {
      logId: number;
      joinDate: string;
      estimateLeftDate: string;
      instanceId: string;
      worldName: string;
    }[] = await dataSource.manager.query(
      `
        SELECT log.ID                         as logId,
               log.Timestamp                  as joinDate,
               log.WorldID                    as instanceId,
               log.WorldName                  as worldName,
               leftDateTable.leftLogId        as leftLogId,
               leftDateTable.estimateLeftDate as estimateLeftDate
        FROM temporaryTable log
               LEFT OUTER JOIN (SELECT a1.ID as     logId,
                                       a1.Timestamp joinDate,
                                       a2.ID        leftLogId,
                                       a2.Timestamp estimateLeftDate
                                FROM temporaryTable a1,
                                     temporaryTable a2
                                WHERE a1.ActivityType = 0
                                  AND (a2.ID =
                                       (SELECT min(a3.ID)
                                        FROM temporaryTable a3
                                        WHERE a3.ID > a1.ID
                                          AND a3.ActivityType = 0))) leftDateTable
                               ON log.ID = leftDateTable.logId
        WHERE log.ActivityType = 0
          ${keywordClause} ${filterClause}
        ORDER BY log.ID DESC;`,
      keywords.map((keyword) => `%${keyword}%`)
    );
    await dataSource.destroy();

    return result.map((item) => {
      return {
        logId: item.logId,
        joinDate: new Date(item.joinDate),
        estimateLeftDate:
          item.estimateLeftDate !== null
            ? new Date(item.estimateLeftDate)
            : new Date(),
        instanceId: item.instanceId,
        worldName: item.worldName,
      } as WorldSearchResult;
    });
  }

  /**
   * ユーザー名からJoinログを検索する
   * @param paths
   * @param keywords
   * @param filter
   */
  async getJoinLogByUserName(
    paths: string[],
    keywords: string[],
    filter?: {
      fromDate?: Date;
      toDate?: Date;
      fromTime?: Date;
      toTime?: Date;
      dayOfWeek?: number;
      instanceType?: InstanceType;
    }
  ): Promise<UserSearchResult[]> {
    const dataSource = await this.initializeDataSource(paths);

    const filterClause = this.generateWhereClause(filter || {}, 'log2');
    const keywordClause =
      keywords.length !== 0
        ? ` ${keywords.map(() => ' log1.UserName LIKE ? ').join(' AND ')}`
        : '';

    const result: {
      logId: number;
      firstJoinDate: string;
      worldJoinLogId: number;
      userName: string;
      worldName: string;
      instanceId: string;
      worldJoinDate: string;
      worldLeftLogId: number;
      estimateLeftDate: string;
    }[] = await dataSource.manager.query(
      `
        SELECT log1.ID                        as logId,
               min(log1.Timestamp)            as firstJoinDate,
               log1.UserName                  as userName,
               log2.ID                        as worldJoinLogId,
               log2.WorldName                 as worldName,
               log2.WorldID                   as instanceId,
               log2.Timestamp                 as worldJoinDate,
               leftDateTable.leftLogId        as worldLeftLogId,
               leftDateTable.estimateLeftDate as estimateLeftDate
        FROM temporaryTable log1,
             temporaryTable log2
               LEFT OUTER JOIN (SELECT a1.ID as     logId,
                                       a1.Timestamp joinDate,
                                       a2.ID        leftLogId,
                                       a2.Timestamp estimateLeftDate
                                FROM temporaryTable a1,
                                     temporaryTable a2
                                WHERE a1.ActivityType = 0
                                  AND (a2.ID =
                                       (SELECT min(a3.ID)
                                        FROM temporaryTable a3
                                        WHERE a3.ID > a1.ID
                                          AND a3.ActivityType = 0))) leftDateTable
                               ON log2.ID = leftDateTable.logId
        WHERE log2.ID = (SELECT max(a3.ID) FROM temporaryTable a3 WHERE a3.ID < log1.ID AND a3.ActivityType = 0)
          AND ${keywordClause} ${filterClause}
        GROUP BY log2.ID
        ORDER BY log1.ID DESC;`,
      keywords.map((keyword) => `%${keyword}%`)
    );
    await dataSource.destroy();

    return result.map((item) => {
      return {
        worldLogId: item.worldJoinLogId,
        userFirstJoinDate: new Date(item.firstJoinDate),
        userName: item.userName,
        estimateLeftDate:
          item.estimateLeftDate !== null
            ? new Date(item.estimateLeftDate)
            : new Date(),
        worldJoinDate: new Date(item.worldJoinDate),
        instanceId: item.instanceId,
        worldName: item.worldName,
      } as UserSearchResult;
    });
  }

  /**
   * キーワードからワールド候補を100件まで取得
   * @param paths DBのパス
   * @param keyword キーワード
   */
  async getWorldSuggestion(
    paths: string[],
    keyword: string
  ): Promise<string[]> {
    const dataSource = await this.initializeDataSource(paths);

    const result: {
      worldName: string;
    }[] = await dataSource.manager.query(
      `
        SELECT DISTINCT(WorldName) as worldName
        FROM temporaryTable
        WHERE WorldName LIKE ? LIMIT 100
      `,
      [`%${keyword}%`]
    );

    return result.map((item) => item.worldName);
  }

  /**
   * キーワードからユーザー候補を100件まで取得
   * @param paths DBのパス
   * @param keyword キーワード
   */
  async getUserSuggestion(paths: string[], keyword: string): Promise<string[]> {
    const dataSource = await this.initializeDataSource(paths);

    const result: {
      userName: string;
    }[] = await dataSource.manager.query(
      `
        SELECT DISTINCT(UserName) as userName
        FROM temporaryTable
        WHERE UserName LIKE ? LIMIT 100
      `,
      [`%${keyword}%`]
    );

    return result.map((item) => item.userName);
  }

  /**
   * 期間内のワールドごとのJoin回数を取得
   * @param paths
   * @param from
   * @param to
   */
  async getWorldJoinCount(
    paths: string[],
    from: Date,
    to: Date
  ): Promise<WorldJoinCount[]> {
    const dataSource = await this.initializeDataSource(paths);

    const result: {
      worldName: string;
      count: number;
    }[] = await dataSource.manager.query(
      `
        SELECT WorldName as worldName, COUNT(*) as count
        FROM temporaryTable
        WHERE ActivityType = 0
          AND ? <= Timestamp
          AND Timestamp <= ?
        GROUP BY WorldName;
      `,
      [
        moment(from).format('YYYY-MM-DD HH:mm:ss'),
        moment(to).format('YYYY-MM-DD HH:mm:ss'),
      ]
    );

    return result.map((item) => {
      return {
        worldName: item.worldName,
        count: item.count,
      } as WorldJoinCount;
    });
  }

  /**
   * 期間内のユーザーごとのJoin回数を取得
   * @param paths
   * @param from
   * @param to
   */
  async getUserJoinCount(
    paths: string[],
    from: Date,
    to: Date
  ): Promise<UserJoinCount[]> {
    const dataSource = await this.initializeDataSource(paths);

    const result: {
      userName: string;
      count: number;
    }[] = await dataSource.manager.query(
      `
        SELECT UserName as userName, COUNT(*) as count
        FROM temporaryTable
        WHERE ActivityType = 1
          AND ? <= Timestamp
          AND Timestamp <= ?
        GROUP BY UserName;
      `,
      [
        moment(from).format('YYYY-MM-DD HH:mm:ss'),
        moment(to).format('YYYY-MM-DD HH:mm:ss'),
      ]
    );

    return result.map((item) => {
      return {
        userName: item.userName,
        count: item.count,
      } as UserJoinCount;
    });
  }

  /**
   * 期間指定でログのタイムスタンプリストを取得
   * @param paths
   * @param from
   * @param to
   */
  async getActivityLogTimestamps(
    paths: string[],
    from: Date,
    to: Date
  ): Promise<Date[]> {
    const dataSource = await this.initializeDataSource(paths);

    const result: {
      timestamp: string;
    }[] = await dataSource.manager.query(
      `
        SELECT Timestamp as timestamp
        FROM temporaryTable
        WHERE ? <= Timestamp
          AND Timestamp <= ?
        ORDER BY Timestamp;
      `,
      [
        moment(from).format('YYYY-MM-DD HH:mm:ss'),
        moment(to).format('YYYY-MM-DD HH:mm:ss'),
      ]
    );

    return result.map((item) => new Date(item.timestamp));
  }

  /**
   * インスタンスタイプ指定で期間内のインスタンスIDリストを取得
   * @param paths
   * @param type
   * @param from
   * @param to
   */
  async getInstanceIds(
    paths: string[],
    type: InstanceType,
    from: Date,
    to: Date
  ): Promise<string[]> {
    const whereClause = this.generateWhereClause({
      instanceType: type,
    });

    const dataSource = await this.initializeDataSource(paths);

    const result: {
      worldId: string;
    }[] = await dataSource.manager.query(
      `
        SELECT DISTINCT WorldID as worldId
        FROM temporaryTable
        WHERE ? <= Timestamp
          AND Timestamp <= ? ${whereClause}
        ORDER BY Timestamp;
      `,
      [
        moment(from).format('YYYY-MM-DD HH:mm:ss'),
        moment(to).format('YYYY-MM-DD HH:mm:ss'),
      ]
    );
    return result.map((item) => item.worldId);
  }

  /**
   * 検索フィルターからWHERE句を生成する
   * @param filter
   * @param table
   * @private
   */
  private generateWhereClause(
    filter: {
      fromDate?: Date;
      toDate?: Date;
      fromTime?: Date;
      toTime?: Date;
      dayOfWeek?: number;
      instanceType?: InstanceType;
    },
    table?: string
  ): string {
    let whereClause = '';
    const tableName = table ? `${table}.` : '';

    // 日付フィルター
    if (filter.fromDate || filter.toDate) {
      const fromDate = filter.fromDate ?? new Date(0);
      const toDate = filter.toDate ?? new Date();
      whereClause += `${tableName}Timestamp BETWEEN '${moment(fromDate).format(
        'YYYY-MM-DD'
      )} 00:00:00' AND '${moment(toDate).format('YYYY-MM-DD')} 23:59:59'`;
    }

    // 時間フィルター
    if (filter.fromTime || filter.toTime) {
      if (whereClause.length > 0) {
        whereClause += ' AND ';
      }
      const fromTime =
        filter.fromTime ?? new Date(new Date().setHours(0, 0, 0, 0));
      const toTime =
        filter.toTime ?? new Date(new Date().setHours(23, 59, 0, 0));
      whereClause += `strftime('%H:%M', ${tableName}Timestamp) BETWEEN '${moment(
        fromTime
      ).format('HH:mm')}' AND '${moment(toTime).format('HH:mm')}'`;
    }

    // 曜日フィルター
    if (filter.dayOfWeek !== null && filter.dayOfWeek !== undefined) {
      if (whereClause.length > 0) {
        whereClause += ' AND ';
      }
      whereClause += `strftime('%w', ${tableName}Timestamp) = '${filter.dayOfWeek}'`;
    }

    // インスタンスタイプフィルター
    if (filter.instanceType) {
      if (whereClause.length > 0) {
        whereClause += ' AND ';
      }
      switch (filter.instanceType) {
        case 'PUBLIC':
          whereClause += `${tableName}worldId NOT LIKE '%~hidden%'
                        AND ${tableName}worldId NOT LIKE '%~friends%'
                        AND ${tableName}worldId NOT LIKE '%~private%'
                        AND ${tableName}worldId NOT LIKE '%~group%'`;
          break;
        case 'FRIEND_PLUS':
          whereClause += `${tableName}worldId LIKE '%~hidden%'`;
          break;
        case 'FRIEND':
          whereClause += `${tableName}worldId LIKE '%~friends%'`;
          break;
        case 'INVITE_PLUS':
          whereClause += `${tableName}worldId LIKE '%~private%'
                        AND ${tableName}worldId LIKE '%~canRequestInvite%'`;
          break;
        case 'INVITE':
          whereClause += `${tableName}worldId LIKE '%~private%'
                        AND ${tableName}worldId NOT LIKE '%~canRequestInvite%'`;
          break;
        case 'GROUP':
          whereClause += `${tableName}worldId LIKE '%~group%'
                        AND ${tableName}worldId LIKE '%~groupAccessType(members)%'`;
          break;
        case 'GROUP_PLUS':
          whereClause += `${tableName}worldId LIKE '%~group%'
                        AND ${tableName}worldId LIKE '%~groupAccessType(plus)%'`;
          break;
        case 'GROUP_PUBLIC':
          whereClause += `${tableName}worldId LIKE '%~group%'
                        AND ${tableName}worldId LIKE '%~groupAccessType(public)%'`;
          break;
        default:
          break;
      }
    }

    // WHERE句が存在する場合は先頭にANDを追加
    if (whereClause.length > 0) {
      whereClause = ` AND ${whereClause}`;
    }

    return whereClause;
  }
}
