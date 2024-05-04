import {
  ErrorResponse,
  PhotoCountResponse,
  UserJoinCountResponse,
  WorldJoinCountResponse,
} from '../../dto/ActivityLog';
import {
  ActivityStaticsDataResponse,
  WorldTypeJoinStatisticsDataResponse,
} from '../../dto/ActivityStatisticsData';

export default interface StatisticsService {
  getWorldJoinCount: (
    from: Date,
    to: Date
  ) => Promise<WorldJoinCountResponse | ErrorResponse>;
  getUserJoinCount: (
    from: Date,
    to: Date
  ) => Promise<UserJoinCountResponse | ErrorResponse>;
  getPhotoCount: (
    from: Date,
    to: Date
  ) => Promise<PhotoCountResponse | ErrorResponse>;
  getActivityHeatmap: (
    from: Date,
    to: Date
  ) => Promise<ActivityStaticsDataResponse | ErrorResponse>;
  getInstanceTypeCount: (
    from: Date,
    to: Date
  ) => Promise<WorldTypeJoinStatisticsDataResponse | ErrorResponse>;
}
