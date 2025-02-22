import { PhotoLog } from '../domain/model/dto/PhotoFile';
import PhotoFileRepositoryImpl from '../infrastructures/repository/PhotoFileRepositoryImpl';
import SettingsRepositoryImpl from '../infrastructures/repository/SettingsRepositoryImpl';
import PhotoFileRepository from '../domain/model/PhotoFileRepository';
import SettingRepository from '../domain/model/SettingRepository';
import DatabaseFilePathNotSetException from '../domain/model/exception/DatabaseFilePathNotSetException';
import PhotoDirectoryNotSetException from '../domain/model/exception/PhotoDirectoryNotSetException';
import { WorldData } from '../domain/model/dto/WorldList';
import InternalDatabaseRepository from '../domain/model/InternalDatabaseRepository';
import InternalDatabaseRepositoryImpl from '../infrastructures/repository/InternalDatabaseRepositoryImpl';
import PhotoEntity from '../infrastructures/entity/photoEntity';
import { ScanResult } from '../domain/model/dto/scanResult';
import { InstanceType } from '../../dto/ActivityStatisticsData';
import MultiActivityLogRepository from '../domain/model/MultiActivityLogRepository';
import MultiActivityLogRepositoryImpl from '../infrastructures/repository/MultiActivityLogRepositoryImpl';
import ActivityLogRepository from '../domain/model/ActivityLogRepository';
import ActivityLogRepositoryImpl from '../infrastructures/repository/ActivityLogRepositoryImpl';

export default class ActivityService {
  activityLogRepository: ActivityLogRepository;

  multiActivityLogRepository: MultiActivityLogRepository;

  photoFileRepository: PhotoFileRepository;

  settingRepository: SettingRepository;

  internalDatabaseRepository: InternalDatabaseRepository;

  scanLock: boolean = false;

  constructor() {
    this.activityLogRepository = new ActivityLogRepositoryImpl();
    this.multiActivityLogRepository = new MultiActivityLogRepositoryImpl();
    this.photoFileRepository = new PhotoFileRepositoryImpl();
    this.settingRepository = new SettingsRepositoryImpl();
    this.internalDatabaseRepository = new InternalDatabaseRepositoryImpl();
  }

  /**
   * 該当期間の写真リストを取得
   */
  public async getPhotos(): Promise<PhotoLog[]> {
    // 設定を取得
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    // Joinログを取得
    const joinLog =
      databasePath.length === 1
        ? await this.activityLogRepository.getAllJoinLog(databasePath[0])
        : await this.multiActivityLogRepository.getAllJoinLog(databasePath);

    // Joinログと写真を突合（高負荷になるとUIが固まるので意図的にPromise.allを使わない）
    const result: PhotoLog[] = [];
    for (let i = 0; i < joinLog.length; i += 1) {
      const photo = await this.internalDatabaseRepository.getPhoto(
        joinLog[i].joinDate,
        joinLog[i].estimateLeftDate
      );
      result.push(
        ...photo.map((item) => {
          return {
            createdDate: item.createdDate,
            originalFilePath: item.originalFilePath,
            instanceId: joinLog[i]?.instanceId,
            joinDate: joinLog[i]?.joinDate,
            estimateLeftDate: joinLog[i]?.estimateLeftDate,
            worldName: joinLog[i]?.worldName,
          } as PhotoLog;
        })
      );
    }

    return result;
  }

  /**
   * 全ワールドログを取得
   */
  async getWorlds(): Promise<WorldData[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // 該当時間のJoinログを取得
    const joinLog =
      databasePaths.length === 1
        ? await this.activityLogRepository.getAllJoinLog(databasePaths[0])
        : await this.multiActivityLogRepository.getAllJoinLog(databasePaths);

    const result: WorldData[] = [];
    for (let i = 0; i < joinLog.length; i += 1) {
      const photo = await this.internalDatabaseRepository.getPhoto(
        joinLog[i].joinDate,
        joinLog[i].estimateLeftDate
      );
      if (photo.length !== 0) {
        result.push({
          instanceId: joinLog[i].instanceId,
          worldName: joinLog[i].worldName,
          joinDate: joinLog[i].joinDate,
          estimateLeftDate: joinLog[i].estimateLeftDate,
        });
      }
    }

    return result;
  }

  /**
   * 該当期間にログのあるユーザーリストを取得
   * @param from 開始期間
   * @param to 終了期間
   */
  async getUsers(from: Date, to: Date): Promise<string[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }
    const userLogs =
      databasePaths.length === 1
        ? await this.activityLogRepository.getUserJoinLog(
            databasePaths[0],
            from,
            to
          )
        : await this.multiActivityLogRepository.getUserJoinLog(
            databasePaths,
            from,
            to
          );
    return userLogs.map((log) => log.userName);
  }

  /**
   * ユーザー名からJoinログを元に写真を検索
   * @param keyword キーワード
   */
  public async searchPhotosByUserName(keyword: string): Promise<PhotoLog[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // クエリをパース
    const { keywords: queryKeyword, filter } = this.parseQuery(keyword);

    // キーワードをもとにJoinログを取得
    const joinLog =
      databasePaths.length === 1
        ? await this.activityLogRepository.getJoinLogByUserName(
            databasePaths[0],
            queryKeyword,
            { instanceType: filter.instanceType }
          )
        : await this.multiActivityLogRepository.getJoinLogByUserName(
            databasePaths,
            queryKeyword,
            { instanceType: filter.instanceType }
          );

    // Joinログの範囲に撮影された写真を検索（UIが固まるのでPromise.allを使わない）
    const result: PhotoLog[] = [];
    for (let i = 0; i < joinLog.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const tmp = await this.internalDatabaseRepository.getPhoto(
        joinLog[i].userFirstJoinDate,
        joinLog[i].estimateLeftDate
      );

      result.push(
        ...tmp
          .filter((item) => {
            return this.filterDate(
              item.createdDate,
              filter.fromDate,
              filter.toDate,
              filter.fromTime,
              filter.toTime,
              filter.dayOfWeek
            );
          })
          .map((item) => {
            return {
              createdDate: item.createdDate,
              originalFilePath: item.originalFilePath,
              instanceId: joinLog[i]?.instanceId,
              joinDate: joinLog[i]?.worldJoinDate,
              estimateLeftDate: joinLog[i]?.estimateLeftDate,
              worldName: joinLog[i]?.worldName,
            } as PhotoLog;
          })
      );
    }

    return result;
  }

  /**
   * ワールド名からJoinログをもとに写真を検索
   * @param keyword キーワード
   */
  public async searchPhotosByWorldName(keyword: string): Promise<PhotoLog[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    const photoDirectories =
      await this.settingRepository.getPhotoDirectoryLocations();
    if (!photoDirectories || photoDirectories.length === 0) {
      throw new PhotoDirectoryNotSetException();
    }

    // クエリをパース
    const { keywords: queryKeyword, filter } = this.parseQuery(keyword);

    // キーワードを元にJoinログを検索
    const joinLog =
      databasePaths.length === 1
        ? await this.activityLogRepository.getJoinLogByWorldName(
            databasePaths[0],
            queryKeyword,
            { instanceType: filter.instanceType }
          )
        : await this.multiActivityLogRepository.getJoinLogByWorldName(
            databasePaths,
            queryKeyword,
            { instanceType: filter.instanceType }
          );

    // Joinログの範囲に撮影された写真を検索（UIが固まるのでPromise.allを使わない）
    const result: PhotoLog[] = [];
    for (let i = 0; i < joinLog.length; i += 1) {
      const photos = await this.internalDatabaseRepository.getPhoto(
        joinLog[i].joinDate,
        joinLog[i].estimateLeftDate
      );

      result.push(
        ...photos
          .filter((item) => {
            return this.filterDate(
              item.createdDate,
              filter.fromDate,
              filter.toDate,
              filter.fromTime,
              filter.toTime,
              filter.dayOfWeek
            );
          })
          .map((item) => {
            return {
              createdDate: item.createdDate,
              originalFilePath: item.originalFilePath,
              instanceId: joinLog[i]?.instanceId,
              joinDate: joinLog[i]?.joinDate,
              estimateLeftDate: joinLog[i]?.estimateLeftDate,
              worldName: joinLog[i]?.worldName,
            } as PhotoLog;
          })
      );
    }

    return result;
  }

  /**
   * ユーザー名からJoinログを元にワールドを検索
   * @param keyword キーワード
   */
  public async searchWorldsByUserName(keyword: string): Promise<WorldData[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // クエリをパース
    const { keywords: queryKeyword, filter } = this.parseQuery(keyword);

    // キーワードを元にJoinログを検索
    const joinLog =
      databasePaths.length === 1
        ? await this.activityLogRepository.getJoinLogByUserName(
            databasePaths[0],
            queryKeyword,
            filter
          )
        : await this.multiActivityLogRepository.getJoinLogByUserName(
            databasePaths,
            queryKeyword,
            filter
          );

    // 該当時間帯に写真があるワールドにフィルターして返す
    const result: WorldData[] = [];
    for (let i = 0; i < joinLog.length; i += 1) {
      const photo = await this.internalDatabaseRepository.getPhoto(
        joinLog[i].worldJoinDate,
        joinLog[i].estimateLeftDate
      );
      if (photo.length !== 0) {
        result.push({
          instanceId: joinLog[i].instanceId,
          worldName: joinLog[i].worldName,
          joinDate: joinLog[i].worldJoinDate,
          estimateLeftDate: joinLog[i].estimateLeftDate,
        });
      }
    }

    return result;
  }

  /**
   * ワールド名からJoinログを元にワールドを検索
   * @param keyword
   */
  public async searchWorldsByWorldName(keyword: string): Promise<WorldData[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // クエリをパース
    const { keywords: queryKeyword, filter } = this.parseQuery(keyword);

    // キーワードを元にJoinログを検索
    const joinLog =
      databasePaths.length === 1
        ? await this.activityLogRepository.getJoinLogByWorldName(
            databasePaths[0],
            queryKeyword,
            filter
          )
        : await this.multiActivityLogRepository.getJoinLogByWorldName(
            databasePaths,
            queryKeyword,
            filter
          );

    // 該当時間帯に写真があるワールドにフィルターして返す
    const result: WorldData[] = [];
    for (let i = 0; i < joinLog.length; i += 1) {
      const photo = await this.internalDatabaseRepository.getPhoto(
        joinLog[i].joinDate,
        joinLog[i].estimateLeftDate
      );
      if (photo.length !== 0) {
        result.push({
          instanceId: joinLog[i].instanceId,
          worldName: joinLog[i].worldName,
          joinDate: joinLog[i].joinDate,
          estimateLeftDate: joinLog[i].estimateLeftDate,
        });
      }
    }

    return result;
  }

  /**
   * キーワードからユーザーの候補リストを取得
   * @param keyword キーワード
   */
  async getWorldSuggestion(keyword: string): Promise<string[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    return databasePaths.length === 1
      ? this.activityLogRepository.getWorldSuggestion(databasePaths[0], keyword)
      : this.multiActivityLogRepository.getWorldSuggestion(
          databasePaths,
          keyword
        );
  }

  /**
   * キーワードからワールド名の候補リストを取得
   * @param keyword キーワード
   */
  async getUserSuggestion(keyword: string): Promise<string[]> {
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    return databasePaths.length === 1
      ? this.activityLogRepository.getUserSuggestion(databasePaths[0], keyword)
      : this.multiActivityLogRepository.getUserSuggestion(
          databasePaths,
          keyword
        );
  }

  /**
   * 写真をスキャンしてSQLiteDBに格納する
   * @param refresh 更新前に初期化するかどうか
   */
  public async scanPhoto(refresh: boolean): Promise<ScanResult> {
    // スキャンが実行中ならエラーを返す
    if (this.scanLock) {
      throw new Error('Scan is already running');
    }
    try {
      // スキャン中フラグを立てる
      this.scanLock = true;
      // フラグがtrueなら格納前に削除
      if (refresh) {
        await this.internalDatabaseRepository.deleteAll();
      }

      // 現在の内容をDBから取得
      const databasePathList = (
        await this.internalDatabaseRepository.getAllPhoto()
      ).map((item) => item.originalFilePath);
      const databasePathSet = new Set(databasePathList);

      // ディレクトリ配下のパスリストを取得
      const filePathList = await this.photoFileRepository.getPhotoFilePathList(
        await this.settingRepository.getPhotoDirectoryLocations()
      );
      const filePathSet = new Set(filePathList);

      // 追加と削除するファイルのリストを作成
      const addPath = filePathList.filter((item) => !databasePathSet.has(item));
      const deletePath = databasePathList.filter(
        (item) => !filePathSet.has(item)
      );

      // 追加対象についてファイル情報を取得
      const addPhoto = await this.photoFileRepository.getFileStatsList(addPath);

      // 挿入前のデータ数を取得
      const oldPhotoCount =
        await this.internalDatabaseRepository.getPhotoCount();

      // 追加対象をSQLiteに格納
      await this.internalDatabaseRepository.insertPhotos(
        addPhoto.map((file) => {
          return {
            path: file.originalFilePath,
            createDate: file.createdDate,
          } as PhotoEntity;
        })
      );

      // 削除対象をSQLiteから削除
      await this.internalDatabaseRepository.deletePhotos(deletePath);

      // スキャン中フラグを解除
      this.scanLock = false;

      return {
        oldPhotoCount,
        photoCount: oldPhotoCount + addPhoto.length,
      };
    } catch (e) {
      // スキャン中フラグを解除
      this.scanLock = false;
      throw e;
    }
  }

  /**
   * 入力からクエリをパースする
   * @param query
   * @private
   */
  private parseQuery(query: string): {
    keywords: string[];
    filter: {
      fromDate?: Date;
      toDate?: Date;
      fromTime?: Date;
      toTime?: Date;
      dayOfWeek?: number;
      instanceType?: InstanceType;
    };
  } {
    const segments = query.split(/\s+/);
    const filter: {
      fromDate?: Date;
      toDate?: Date;
      fromTime?: Date;
      toTime?: Date;
      dayOfWeek?: number;
      instanceType?: InstanceType;
    } = {};
    const keywords: string[] = [];

    segments.forEach((segment) => {
      if (segment.startsWith('since:')) {
        const dateStr = segment.replace('since:', '');
        if (this.isValidDate(dateStr)) {
          const date = new Date(dateStr);
          date.setHours(0, 0, 0, 0);
          filter.fromDate = date;
        }
      } else if (segment.startsWith('until:')) {
        const dateStr = segment.replace('until:', '');
        if (this.isValidDate(dateStr)) {
          const date = new Date(dateStr);
          date.setHours(23, 59, 59, 999);
          filter.toDate = date;
        }
      } else if (segment.startsWith('sinceTime:')) {
        const timeStr = segment.replace('sinceTime:', '');
        if (this.isValidTime(timeStr)) {
          filter.fromTime = new Date(`1970-01-01T${timeStr}:00`);
        }
      } else if (segment.startsWith('untilTime:')) {
        const timeStr = segment.replace('untilTime:', '');
        if (this.isValidTime(timeStr)) {
          filter.toTime = new Date(`1970-01-01T${timeStr}:00`);
        }
      } else if (segment.startsWith('dayOfWeek:')) {
        const dayOfWeek = this.getWeekNumber(segment.replace('dayOfWeek:', ''));
        if (dayOfWeek !== null) {
          filter.dayOfWeek = dayOfWeek;
        }
      } else if (segment.startsWith('instanceType:')) {
        const type = this.getInstanceType(segment.replace('instanceType:', ''));
        if (type) {
          filter.instanceType = type;
        }
      } else {
        keywords.push(segment);
      }
    });

    return {
      keywords,
      filter,
    };
  }

  private isValidDate(dateStr: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  }

  private isValidTime(timeStr: string): boolean {
    return /^\d{2}:\d{2}$/.test(timeStr);
  }

  private getInstanceType(type: string): InstanceType | null {
    switch (type) {
      case 'public':
        return 'PUBLIC';
      case 'friend_plus':
        return 'FRIEND_PLUS';
      case 'friend':
        return 'FRIEND';
      case 'invite_plus':
        return 'INVITE_PLUS';
      case 'invite':
        return 'INVITE';
      case 'group':
        return 'GROUP';
      case 'group_plus':
        return 'GROUP_PLUS';
      case 'group_public':
        return 'GROUP_PUBLIC';
      default:
        return null;
    }
  }

  /**
   * ターゲットの日付がフィルター条件に当てはまるかを返す
   *
   * @param targetDate
   * @param fromDate
   * @param toDate
   * @param fromTime
   * @param toTime
   * @param dayOfWeek
   * @private
   */
  private filterDate(
    targetDate: Date,
    fromDate?: Date,
    toDate?: Date,
    fromTime?: Date,
    toTime?: Date,
    dayOfWeek?: number
  ): boolean {
    if (fromDate && targetDate < fromDate) {
      return false;
    }
    if (toDate && targetDate > toDate) {
      return false;
    }
    if (fromTime && targetDate.getHours() < fromTime.getHours()) {
      return false;
    }
    if (
      fromTime &&
      targetDate.getHours() === fromTime.getHours() &&
      targetDate.getMinutes() < fromTime.getMinutes()
    ) {
      return false;
    }
    if (toTime && targetDate.getHours() > toTime.getHours()) {
      return false;
    }
    if (
      toTime &&
      targetDate.getHours() === toTime.getHours() &&
      targetDate.getMinutes() >= toTime.getMinutes()
    ) {
      return false;
    }
    if (dayOfWeek !== undefined && targetDate.getDay() !== dayOfWeek) {
      return false;
    }

    return true;
  }

  private getWeekNumber(weekDay: string): number | null {
    switch (weekDay) {
      case 'sunday':
        return 0;
      case 'monday':
        return 1;
      case 'tuesday':
        return 2;
      case 'wednesday':
        return 3;
      case 'thursday':
        return 4;
      case 'friday':
        return 5;
      case 'saturday':
        return 6;
      default:
        return null;
    }
  }
}
