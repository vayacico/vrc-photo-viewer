export default interface SettingRepository {
  getSettingFileLocation(): Promise<string>;

  getDbFileLocation(): Promise<string[]>;

  getPhotoDirectoryLocations(): Promise<string[]>;

  getLanguage(): Promise<'ja' | 'en'>;

  updateDbFileLocation(path: string[]): Promise<void>;

  updatePhotoDirectoryLocations(paths: string[]): Promise<void>;

  updateLanguage(lng: 'ja' | 'en'): Promise<void>;
}
