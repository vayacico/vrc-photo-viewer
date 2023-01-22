import {
  ErrorResponse,
  PhotoResponse,
  WorldResponse,
} from '../../dto/ActivityLog';
import { ScanResultResponse } from '../../dto/ScanResult';

export default interface LogService {
  getPhotos: () => Promise<PhotoResponse | ErrorResponse>;
  getWorlds: () => Promise<WorldResponse | ErrorResponse>;
  getUsers: (from: Date, to: Date) => Promise<string[]>;
  scanPhoto: (refresh: boolean) => Promise<ScanResultResponse | ErrorResponse>;
}
