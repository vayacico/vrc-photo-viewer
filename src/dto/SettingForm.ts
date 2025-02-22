export interface SettingForm {
  databaseFilePath: string[];
  imageDirectoryPaths: string[];
}

export interface ApplyResponse {
  status: 'success' | 'failed';
  errorCode?: 'FILE_INVALID' | 'UNKNOWN';
  message?: string;
}
