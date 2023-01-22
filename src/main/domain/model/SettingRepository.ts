export default interface SettingRepository {
  getSettingFileLocation(): Promise<string>;

  getDbFileLocation(): Promise<string>;

  getPhotoDirectoryLocations(): Promise<string[]>;

  updateDbFileLocation(path: string): Promise<void>;

  updatePhotoDirectoryLocations(paths: string[]): Promise<void>;
}
