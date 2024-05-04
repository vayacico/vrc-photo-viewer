import { Photo } from './dto/photo';
import PhotoEntity from '../../infrastructures/entity/photoEntity';

export default interface InternalDatabaseRepository {
  getAllPhoto(): Promise<Photo[]>;

  getPhoto(from: Date, to: Date): Promise<Photo[]>;

  getPhotoTimestamps(from: Date, to: Date): Promise<Date[]>;

  getPhotoCount(): Promise<number>;

  insertPhotos(entities: PhotoEntity[]): Promise<void>;

  deletePhotos(paths: string[]): Promise<void>;

  deleteAll(): Promise<void>;
}
