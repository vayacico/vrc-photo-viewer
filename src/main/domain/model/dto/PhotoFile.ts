export interface PhotoLog {
  createdDate: Date;
  joinDate: Date;
  estimateLeftDate: Date;
  originalFilePath: string;
  instanceId: string;
  worldName: string;
}

export interface PhotoFile {
  createdDate: Date;
  originalFilePath: string;
}
