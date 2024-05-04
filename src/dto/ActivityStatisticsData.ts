export type WeekDay =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export type InstanceType =
  | 'PUBLIC'
  | 'FRIEND_PLUS'
  | 'FRIEND'
  | 'INVITE_PLUS'
  | 'INVITE'
  | 'GROUP'
  | 'GROUP_PLUS'
  | 'GROUP_PUBLIC';

export interface ActivityStaticsDataResponse {
  status: 'success';
  data: ActivityStatisticsData[];
}

export interface WorldTypeJoinStatisticsDataResponse {
  status: 'success';
  data: WorldTypeJoinStatisticsData[];
}

export interface ActivityStatisticsData {
  dayOfWeek: WeekDay;
  countByHour: {
    log: number;
    photo: number;
  }[];
}

export interface UserJoinStatisticsData {
  userName: string;
  count: number;
}

export interface WorldJoinStatisticsData {
  worldName: string;
  count: number;
}

export interface WorldTypeJoinStatisticsData {
  type: InstanceType;
  count: number;
}
