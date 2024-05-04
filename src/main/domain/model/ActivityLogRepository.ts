import { WorldSearchResult } from './dto/WorldSeatchResult';
import { UserLog } from './dto/UserLog';
import { UserSearchResult } from './dto/UserSearchResult';
import { UserJoinCount, WorldJoinCount } from '../../../dto/ActivityLog';
import { InstanceType } from '../../../dto/ActivityStatisticsData';

export default interface ActivityLogRepository {
  getUserJoinLog(path: string, from: Date, to: Date): Promise<UserLog[]>;

  getAllJoinLog(path: string): Promise<WorldSearchResult[]>;

  getJoinLogByWorldName(
    path: string,
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
    path: string,
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
    path: string,
    from: Date,
    to: Date
  ): Promise<WorldJoinCount[]>;

  getUserJoinCount(
    path: string,
    from: Date,
    to: Date
  ): Promise<UserJoinCount[]>;

  getActivityLogTimestamps(path: string, from: Date, to: Date): Promise<Date[]>;

  getUserSuggestion(path: string, keyword: string): Promise<string[]>;

  getWorldSuggestion(path: string, keyword: string): Promise<string[]>;

  getInstanceIds(
    path: string,
    type: InstanceType,
    from: Date,
    to: Date
  ): Promise<string[]>;
}
