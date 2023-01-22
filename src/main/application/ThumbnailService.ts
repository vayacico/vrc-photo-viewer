import * as electron from 'electron';
import ThumbnailRepositoryImpl from '../infrastructures/repository/ThumbnailRepositoryImpl';
import ThumbnailRepository from '../domain/model/ThumbnailRepository';

export default class ThumbnailService {
  thumbnailRepository: ThumbnailRepository;

  constructor() {
    this.thumbnailRepository = new ThumbnailRepositoryImpl();
  }

  /**
   * サムネイル画像のURLを取得。生成済みでない場合は生成してから返す。
   * @param originalFilePath
   */
  public async getThumbnail(originalFilePath: string): Promise<string> {
    return this.thumbnailRepository.getImageThumbPath(originalFilePath);
  }

  /**
   * サムネイルが保存されているディレクトリをOSで開く
   */
  public async openThumbnailDirectory(): Promise<void> {
    const directoryPath =
      await this.thumbnailRepository.getThumbnailDirectoryPath();
    await electron.shell.openPath(directoryPath);
  }
}
