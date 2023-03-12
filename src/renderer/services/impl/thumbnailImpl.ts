import ThumbnailService from '../thumbnail';

export default class ThumbnailServiceImpl implements ThumbnailService {
  getThumbnail(originalFilePath: string): Promise<string> {
    return Promise.resolve('');
  }

  openThumbnailDirectory(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
