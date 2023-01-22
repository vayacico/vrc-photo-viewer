import { PhotoFile } from './dto/PhotoFile';

export default interface PhotoFileRepository {
  getPhotoFilePathList(directoryPaths: string[]): Promise<string[]>;

  getFileStatsList(paths: string[]): Promise<PhotoFile[]>;
}
