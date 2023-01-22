import { SettingForm } from '../../dto/SettingForm';

export default interface FileSettingService {
  openSettingFile(): Promise<void>;

  getDbFileLocation(): Promise<string>;

  getPhotoDirectoryLocations(): Promise<string[]>;

  applySetting(settingForm: SettingForm): Promise<void>;

  selectDatabaseFileLocation(): Promise<string | null>;

  selectPhotoDirectoryLocation(): Promise<string | null>;
}
