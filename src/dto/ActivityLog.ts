export interface PhotoResponse {
  status: 'success';
  data: PhotoData[];
}

export interface PhotoData {
  createdDate: Date;
  joinDate: Date;
  estimateLeftDate: Date;
  originalFilePath: string;
  instanceId: string;
  worldName: string;
}

export interface WorldResponse {
  status: 'success';
  data: WorldData[];
}

export interface WorldData {
  instanceId: string;
  worldName: string;
  joinDate: Date;
  estimateLeftDate: Date;
}

export interface PhotoCountResponse {
  status: 'success';
  count: number;
}

export interface WorldJoinCountResponse {
  status: 'success';
  data: WorldJoinCount[];
}

export interface WorldJoinCount {
  worldName: string;
  count: number;
}

export interface UserJoinCountResponse {
  status: 'success';
  data: UserJoinCount[];
}

export interface UserJoinCount {
  userName: string;
  count: number;
}

export interface ErrorResponse {
  status: 'failed';
  errorCode: 'FILE_INVALID' | 'FILE_NOT_SET' | 'DIRECTORY_NOT_SET' | 'UNKNOWN';
  message: string;
}
