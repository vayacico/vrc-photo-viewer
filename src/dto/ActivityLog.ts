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

export interface ErrorResponse {
  status: 'failed';
  errorCode: 'FILE_INVALID' | 'FILE_NOT_SET' | 'DIRECTORY_NOT_SET' | 'UNKNOWN';
  message: string;
}
