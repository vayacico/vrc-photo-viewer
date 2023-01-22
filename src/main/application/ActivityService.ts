import { PhotoLog } from '../domain/model/dto/PhotoFile';
import PhotoFileRepositoryImpl from '../infrastructures/repository/PhotoFileRepositoryImpl';
import SettingsRepositoryImpl from '../infrastructures/repository/SettingsRepositoryImpl';
import ActivityLogRepository from '../domain/model/ActivityLogRepository';
import PhotoFileRepository from '../domain/model/PhotoFileRepository';
import SettingRepository from '../domain/model/SettingRepository';
import ActivityLogRepositoryImpl from '../infrastructures/repository/ActivityLogRepositoryImpl';
import DatabaseFilePathNotSetException from '../domain/model/exception/DatabaseFilePathNotSetException';
import PhotoDirectoryNotSetException from '../domain/model/exception/PhotoDirectoryNotSetException';
import { WorldData } from '../domain/model/dto/WorldList';
import InternalDatabaseRepository from '../domain/model/InternalDatabaseRepository';
import InternalDatabaseRepositoryImpl from '../infrastructures/repository/InternalDatabaseRepositoryImpl';
import PhotoEntity from '../infrastructures/entity/photoEntity';
import { ScanResult } from '../domain/model/dto/scanResult';

export default class ActivityService {
  activityLogRepository: ActivityLogRepository;

  photoFileRepository: PhotoFileRepository;

  settingRepository: SettingRepository;

  internalDatabaseRepository: InternalDatabaseRepository;

  constructor() {
    this.activityLogRepository = new ActivityLogRepositoryImpl();
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
    const joinLog = await this.activityLogRepository.getAllJoinLog(
      databasePath
    );

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
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    // 該当時間のJoinログを取得
    const joinLog = await this.activityLogRepository.getAllJoinLog(
      databasePath
    );

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
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }
    const userLogs = await this.activityLogRepository.getUserJoinLog(
      databasePath,
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
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    // キーワードをもとにJoinログを取得
    const joinLog = await this.activityLogRepository.getJoinLogByUserName(
      databasePath,
      keyword
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
        ...tmp.map((item) => {
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
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    const photoDirectories =
      await this.settingRepository.getPhotoDirectoryLocations();
    if (!photoDirectories || photoDirectories.length === 0) {
      throw new PhotoDirectoryNotSetException();
    }

    // キーワードを元にJoinログを検索
    const joinLog = await this.activityLogRepository.getJoinLogByWorldName(
      databasePath,
      keyword
    );

    // Joinログの範囲に撮影された写真を検索（UIが固まるのでPromise.allを使わない）
    const result: PhotoLog[] = [];
    for (let i = 0; i < joinLog.length; i += 1) {
      const photos = await this.internalDatabaseRepository.getPhoto(
        joinLog[i].joinDate,
        joinLog[i].estimateLeftDate
      );

      result.push(
        ...photos.map((item) => {
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
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    // キーワードを元にJoinログを検索
    const joinLog = await this.activityLogRepository.getJoinLogByUserName(
      databasePath,
      keyword
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
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    // キーワードを元にJoinログを検索
    const joinLog = await this.activityLogRepository.getJoinLogByWorldName(
      databasePath,
      keyword
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
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    return this.activityLogRepository.getWorldSuggestion(databasePath, keyword);
  }

  /**
   * キーワードからワールド名の候補リストを取得
   * @param keyword キーワード
   */
  async getUserSuggestion(keyword: string): Promise<string[]> {
    const databasePath = await this.settingRepository.getDbFileLocation();
    if (!databasePath) {
      throw new DatabaseFilePathNotSetException();
    }

    return this.activityLogRepository.getUserSuggestion(databasePath, keyword);
  }

  /**
   * 写真をスキャンしてSQLiteDBに格納する
   * @param refresh 更新前に初期化するかどうか
   */
  public async scanPhoto(refresh: boolean): Promise<ScanResult> {
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
    const oldPhotoCount = await this.internalDatabaseRepository.getPhotoCount();

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

    return {
      oldPhotoCount,
      photoCount: oldPhotoCount + addPhoto.length,
    };
  }
}
