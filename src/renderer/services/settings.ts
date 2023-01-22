import { ApplyResponse, SettingForm } from '../../dto/SettingForm';

export default interface SettingService {
  openSettingFile: () => Promise<string>;
  getDbFileLocation: () => Promise<string>;
  getPhotoDirectoryLocations: () => Promise<string[]>;
  selectDbFileLocation: () => Promise<string | null>;
  selectPhotoDirectoryLocation: () => Promise<string | null>;
  updateFileSetting: (settingForm: SettingForm) => Promise<ApplyResponse>;
}
