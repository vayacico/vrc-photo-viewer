import moment from 'moment';
import { DataSource } from 'typeorm';
import { UserSearchResult } from 'main/domain/model/dto/UserSearchResult';
import ActivityLogRepository from '../../domain/model/ActivityLogRepository';
import { WorldSearchResult } from '../../domain/model/dto/WorldSeatchResult';
import { UserLog } from '../../domain/model/dto/UserLog';
import ActivityLogsEntity from '../entity/activityLogsEntity';

export default class ActivityLogRepositoryImpl
  implements ActivityLogRepository
{
  /**
   * DBから該当期間にログのあるユーザーを取得する
   * @param path
   * @param from
   * @param to
   */
  public async getUserJoinLog(
    path: string,
    from: Date,
    to: Date
  ): Promise<UserLog[]> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: path,
    });
    await dataSource.initialize();

    // ユーザー取得
    const result: {
      ID: number;
      UserName: string;
      Timestamp: string;
    }[] = await dataSource.query(
      'SELECT MIN(ID), UserName, MIN(Timestamp) from ActivityLogs WHERE ActivityType = 1 AND ? <= Timestamp AND Timestamp <= ? GROUP BY UserName ORDER BY MIN(Timestamp)',
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
   * @param path
   */
  async getAllJoinLog(path: string): Promise<WorldSearchResult[]> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: path,
    });
    await dataSource.initialize();

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
      FROM ActivityLogs log
             LEFT OUTER JOIN (
        SELECT a1.ID as     logId,
               a1.Timestamp joinDate,
               a2.ID        leftLogId,
               a2.Timestamp estimateLeftDate
        FROM ActivityLogs a1,
             ActivityLogs a2
        WHERE a1.ActivityType = 0
          AND (a2.ID =
               (SELECT min(a3.ID) FROM ActivityLogs a3 WHERE a3.ID > a1.ID AND a3.ActivityType = 0))
      ) leftDateTable
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
   * @param path
   * @param keyword
   */
  async getJoinLogByWorldName(
    path: string,
    keyword: string
  ): Promise<WorldSearchResult[]> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: path,
    });
    await dataSource.initialize();

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
        FROM ActivityLogs log
               LEFT OUTER JOIN (
          SELECT a1.ID as     logId,
                 a1.Timestamp joinDate,
                 a2.ID        leftLogId,
                 a2.Timestamp estimateLeftDate
          FROM ActivityLogs a1,
               ActivityLogs a2
          WHERE a1.ActivityType = 0
            AND (a2.ID =
                 (SELECT min(a3.ID) FROM ActivityLogs a3 WHERE a3.ID > a1.ID AND a3.ActivityType = 0))
        ) leftDateTable
                               ON log.ID = leftDateTable.logId
        WHERE log.ActivityType = 0
          AND log.WorldName LIKE ?
        ORDER BY log.ID DESC;`,
      [`%${keyword}%`]
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
   * @param path
   * @param keyword
   */
  async getJoinLogByUserName(
    path: string,
    keyword: string
  ): Promise<UserSearchResult[]> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: path,
      entities: [ActivityLogsEntity],
    });
    await dataSource.initialize();

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
        FROM ActivityLogs log1,
             ActivityLogs log2
               LEFT OUTER JOIN (
               SELECT a1.ID as     logId,
                      a1.Timestamp joinDate,
                      a2.ID        leftLogId,
                      a2.Timestamp estimateLeftDate
               FROM ActivityLogs a1,
                    ActivityLogs a2
               WHERE a1.ActivityType = 0
                 AND (a2.ID =
                      (SELECT min(a3.ID)
                       FROM ActivityLogs a3
                       WHERE a3.ID > a1.ID
                         AND a3.ActivityType = 0))) leftDateTable
                               ON log2.ID = leftDateTable.logId
        WHERE log1.UserName like ?
          AND log2.ID = (SELECT max(a3.ID) FROM ActivityLogs a3 WHERE a3.ID < log1.ID AND a3.ActivityType = 0)
        GROUP BY log2.ID
        ORDER BY log1.ID DESC;`,
      [`%${keyword}%`]
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
   * @param path DBのパス
   * @param keyword キーワード
   */
  async getWorldSuggestion(path: string, keyword: string): Promise<string[]> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: path,
    });
    await dataSource.initialize();

    const result: {
      worldName: string;
    }[] = await dataSource.manager.query(
      `
        SELECT DISTINCT(WorldName) as worldName
        FROM ActivityLogs
        WHERE WorldName LIKE ? LIMIT 100
      `,
      [`%${keyword}%`]
    );

    return result.map((item) => item.worldName);
  }

  /**
   * キーワードからユーザー候補を100件まで取得
   * @param path DBのパス
   * @param keyword キーワード
   */
  async getUserSuggestion(path: string, keyword: string): Promise<string[]> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: path,
    });
    await dataSource.initialize();

    const result: {
      userName: string;
    }[] = await dataSource.manager.query(
      `
        SELECT DISTINCT(UserName) as userName
        FROM ActivityLogs
        WHERE UserName LIKE ? LIMIT 100
      `,
      [`%${keyword}%`]
    );

    return result.map((item) => item.userName);
  }
}
