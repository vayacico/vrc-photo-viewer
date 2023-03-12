import LogService from '../log';
import {
  ErrorResponse,
  PhotoResponse,
  WorldResponse,
} from '../../../dto/ActivityLog';
import { ScanResultResponse } from '../../../dto/ScanResult';

export default class LogServiceImpl implements LogService {
  getPhotos(): Promise<PhotoResponse | ErrorResponse> {
    return Promise.resolve({ status: 'success', data: [] });
  }

  getUsers(from: Date, to: Date): Promise<string[]> {
    return Promise.resolve([]);
  }

  getWorlds(): Promise<WorldResponse | ErrorResponse> {
    return Promise.resolve({ status: 'success', data: [] });
  }

  scanPhoto(refresh: boolean): Promise<ScanResultResponse | ErrorResponse> {
    return Promise.resolve({
      status: 'success',
      oldPhotoCount: 0,
      photoCount: 0,
    });
  }
}
