import { WorldSearchResult } from './dto/WorldSeatchResult';
import { UserLog } from './dto/UserLog';
import { UserSearchResult } from './dto/UserSearchResult';
import { UserJoinCount, WorldJoinCount } from '../../../dto/ActivityLog';
import { InstanceType } from '../../../dto/ActivityStatisticsData';

export default interface MultiActivityLogRepository {
  getUserJoinLog(paths: string[], from: Date, to: Date): Promise<UserLog[]>;

  getAllJoinLog(paths: string[]): Promise<WorldSearchResult[]>;

  getJoinLogByWorldName(
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
  ): Promise<WorldSearchResult[]>;

  getJoinLogByUserName(
    path: string[],
    keywords: string[],
    filter?: {
      fromDate?: Date;
      toDate?: Date;
      fromTime?: Date;
      toTime?: Date;
      dayOfWeek?: number;
      instanceType?: InstanceType;
    }
  ): Promise<UserSearchResult[]>;

  getWorldJoinCount(
    paths: string[],
    from: Date,
    to: Date
  ): Promise<WorldJoinCount[]>;

  getUserJoinCount(
    paths: string[],
    from: Date,
    to: Date
  ): Promise<UserJoinCount[]>;

  getActivityLogTimestamps(
    paths: string[],
    from: Date,
    to: Date
  ): Promise<Date[]>;

  getUserSuggestion(paths: string[], keyword: string): Promise<string[]>;

  getWorldSuggestion(paths: string[], keyword: string): Promise<string[]>;

  getInstanceIds(
    paths: string[],
    type: InstanceType,
    from: Date,
    to: Date
  ): Promise<string[]>;
}
