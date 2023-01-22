import { PhotoLog } from '../domain/model/dto/PhotoFile';
import { WorldData } from '../domain/model/dto/WorldList';
import { ScanResult } from '../domain/model/dto/scanResult';

export default interface ActivityService {
  getPhotos(from: Date, to: Date, results: number): Promise<PhotoLog[]>;

  getWorlds(from: Date, to: Date, results: number): Promise<WorldData[]>;

  getUsers(from: Date, to: Date): Promise<string[]>;

  searchWorldsByWorldName(keyword: string): Promise<WorldData[]>;

  searchWorldsByUserName(keyword: string): Promise<WorldData[]>;

  searchPhotosByWorldName(keyword: string): Promise<PhotoLog[]>;

  searchPhotosByUserName(keyword: string): Promise<PhotoLog[]>;

  getWorldSuggestion(keyword: string): Promise<string[]>;

  getUserSuggestion(keyword: string): Promise<string[]>;

  scanPhoto(refresh: boolean): Promise<ScanResult>;
}
