import SettingService from '../settings';
import { ApplyResponse, SettingForm } from '../../../dto/SettingForm';

export default class SettingServiceImpl implements SettingService {
  getDbFileLocation(): Promise<string> {
    return Promise.resolve('');
  }

  getPhotoDirectoryLocations(): Promise<string[]> {
    return Promise.resolve([]);
  }

  openSettingFile(): Promise<string> {
    return Promise.resolve('');
  }

  selectDbFileLocation(): Promise<string | null> {
    return Promise.resolve('');
  }

  selectPhotoDirectoryLocation(): Promise<string | null> {
    return Promise.resolve('');
  }

  updateFileSetting(settingForm: SettingForm): Promise<ApplyResponse> {
    return Promise.resolve({ status: 'success' });
  }
}
