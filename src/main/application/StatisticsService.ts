import {
  ActivityStatisticsData,
  UserJoinStatisticsData,
  WeekDay,
  WorldJoinStatisticsData,
  WorldTypeJoinStatisticsData,
} from '../../dto/ActivityStatisticsData';
import PhotoFileRepository from '../domain/model/PhotoFileRepository';
import SettingRepository from '../domain/model/SettingRepository';
import InternalDatabaseRepository from '../domain/model/InternalDatabaseRepository';
import PhotoFileRepositoryImpl from '../infrastructures/repository/PhotoFileRepositoryImpl';
import SettingsRepositoryImpl from '../infrastructures/repository/SettingsRepositoryImpl';
import InternalDatabaseRepositoryImpl from '../infrastructures/repository/InternalDatabaseRepositoryImpl';
import DatabaseFilePathNotSetException from '../domain/model/exception/DatabaseFilePathNotSetException';
import MultiActivityLogRepository from '../domain/model/MultiActivityLogRepository';
import MultiActivityLogRepositoryImpl from '../infrastructures/repository/MultiActivityLogRepositoryImpl';
import ActivityLogRepository from '../domain/model/ActivityLogRepository';
import ActivityLogRepositoryImpl from '../infrastructures/repository/ActivityLogRepositoryImpl';

export default class StatisticsService {
  activityLogRepository: ActivityLogRepository;

  multiActivityLogRepository: MultiActivityLogRepository;

  photoFileRepository: PhotoFileRepository;

  settingRepository: SettingRepository;

  internalDatabaseRepository: InternalDatabaseRepository;

  constructor() {
    this.activityLogRepository = new ActivityLogRepositoryImpl();
    this.multiActivityLogRepository = new MultiActivityLogRepositoryImpl();
    this.photoFileRepository = new PhotoFileRepositoryImpl();
    this.settingRepository = new SettingsRepositoryImpl();
    this.internalDatabaseRepository = new InternalDatabaseRepositoryImpl();
  }

  /**
   * 指定した期間内の写真の枚数を取得する
   * @param from
   * @param to
   */
  public async getPhotoTakenCount(from: Date, to: Date): Promise<number> {
    const photoCount = await this.internalDatabaseRepository.getPhotoTimestamps(
      from,
      to
    );
    return photoCount.length;
  }

  /**
   * 指定した期間内の曜日・時刻別アクティビティ数を取得する
   * @param from
   * @param to
   */
  public async getActivityCountMap(
    from: Date,
    to: Date
  ): Promise<ActivityStatisticsData[]> {
    // 設定を取得
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // アクティビティログのタイムスタンプリストを取得
    const activityLogTimeStamps =
      databasePaths.length === 1
        ? await this.activityLogRepository.getActivityLogTimestamps(
            databasePaths[0],
            from,
            to
          )
        : await this.multiActivityLogRepository.getActivityLogTimestamps(
            databasePaths,
            from,
            to
          );

    // 写真のタイムスタンプリストを取得
    const photoTimeStamps =
      await this.internalDatabaseRepository.getPhotoTimestamps(from, to);

    // 曜日ごとの時間帯別のアクティビティ数を集計
    const activityCountMap = new Map<
      WeekDay,
      {
        log: number;
        photo: number;
      }[]
    >();
    // マップを初期化
    for (let i = 0; i < 7; i += 1) {
      const week = this.getWeekText(i);
      activityCountMap.set(
        week,
        Array.from({ length: 24 }, () => ({ log: 0, photo: 0 }))
      );
    }
    // アクティビティ数を格納
    activityLogTimeStamps.forEach((activityLogTimeStamp) => {
      const week = this.getWeekText(activityLogTimeStamp.getDay());
      const hour = activityLogTimeStamp.getHours();
      const count = activityCountMap.get(week);
      if (count) {
        count[hour].log += 1;
        activityCountMap.set(week, count);
      }
    });
    // 写真枚数を格納
    photoTimeStamps.forEach((photoTimeStamp) => {
      const week = this.getWeekText(photoTimeStamp.getDay());
      const hour = photoTimeStamp.getHours();
      const count = activityCountMap.get(week);
      if (count) {
        count[hour].photo += 1;
        activityCountMap.set(week, count);
      }
    });

    // 結果を返却
    return Array.from(activityCountMap).map(([week, countByHour]) => {
      return {
        dayOfWeek: week,
        countByHour,
      };
    });
  }

  /**
   * 指定した期間内のワールドごとの訪問回数を取得する
   * @param from
   * @param to
   */
  public async getWorldJoinedCount(
    from: Date,
    to: Date
  ): Promise<WorldJoinStatisticsData[]> {
    // 設定を取得
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // ワールドごとの訪問回数を取得
    const worldJoinCount =
      databasePaths.length === 1
        ? await this.activityLogRepository.getWorldJoinCount(
            databasePaths[0],
            from,
            to
          )
        : await this.multiActivityLogRepository.getWorldJoinCount(
            databasePaths,
            from,
            to
          );

    // 結果を返却
    return worldJoinCount.map((data) => {
      return {
        worldName: data.worldName,
        count: data.count,
      };
    });
  }

  public async getUserJoinedCount(
    from: Date,
    to: Date
  ): Promise<UserJoinStatisticsData[]> {
    // 設定を取得
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // ユーザごとの訪問回数を取得
    const userJoinCount =
      databasePaths.length === 1
        ? await this.activityLogRepository.getUserJoinCount(
            databasePaths[0],
            from,
            to
          )
        : await this.multiActivityLogRepository.getUserJoinCount(
            databasePaths,
            from,
            to
          );

    // 結果を返却
    return userJoinCount.map((data) => {
      return {
        userName: data.userName,
        count: data.count,
      };
    });
  }

  /**
   * 指定した期間内のインスタンスタイプ別訪問回数を取得する
   * @param from
   * @param to
   */
  public async getInstancesTypeCount(
    from: Date,
    to: Date
  ): Promise<WorldTypeJoinStatisticsData[]> {
    // 設定を取得
    const databasePaths = await this.settingRepository.getDbFileLocation();
    if (!databasePaths) {
      throw new DatabaseFilePathNotSetException();
    }

    // インスタンスタイプ別の訪問回数を取得
    const result: WorldTypeJoinStatisticsData[] = [];
    result.push({
      type: 'PUBLIC',
      count:
        databasePaths.length === 1
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'PUBLIC', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'PUBLIC', from, to)
              .then((ids) => ids.length),
    });
    result.push({
      type: 'FRIEND_PLUS',
      count:
        databasePaths.length === 1
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'FRIEND_PLUS', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'FRIEND_PLUS', from, to)
              .then((ids) => ids.length),
    });
    result.push({
      type: 'FRIEND',
      count:
        databasePaths.length === 0
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'FRIEND', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'FRIEND', from, to)
              .then((ids) => ids.length),
    });
    result.push({
      type: 'INVITE_PLUS',
      count:
        databasePaths.length === 1
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'INVITE_PLUS', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'INVITE_PLUS', from, to)
              .then((ids) => ids.length),
    });
    result.push({
      type: 'INVITE',
      count:
        databasePaths.length === 1
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'INVITE', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'INVITE', from, to)
              .then((ids) => ids.length),
    });
    result.push({
      type: 'GROUP',
      count:
        databasePaths.length === 1
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'GROUP', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'GROUP', from, to)
              .then((ids) => ids.length),
    });
    result.push({
      type: 'GROUP_PLUS',
      count:
        databasePaths.length === 1
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'GROUP_PLUS', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'GROUP_PLUS', from, to)
              .then((ids) => ids.length),
    });
    result.push({
      type: 'GROUP_PUBLIC',
      count:
        databasePaths.length === 1
          ? await this.activityLogRepository
              .getInstanceIds(databasePaths[0], 'GROUP_PUBLIC', from, to)
              .then((ids) => ids.length)
          : await this.multiActivityLogRepository
              .getInstanceIds(databasePaths, 'GROUP_PUBLIC', from, to)
              .then((ids) => ids.length),
    });
    return result;
  }

  private getWeekText(day: number): WeekDay {
    switch (day) {
      case 0:
        return 'Sunday';
      case 1:
        return 'Monday';
      case 2:
        return 'Tuesday';
      case 3:
        return 'Wednesday';
      case 4:
        return 'Thursday';
      case 5:
        return 'Friday';
      case 6:
        return 'Saturday';
      default:
        return 'Sunday';
    }
  }
}
