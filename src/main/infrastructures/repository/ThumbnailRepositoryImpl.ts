import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp';
import electron from 'electron';
import ThumbnailRepository from '../../domain/model/ThumbnailRepository';

export default class ThumbnailRepositoryImpl implements ThumbnailRepository {
  /**
   * 画像パスを受け取りサムネイル画像のパスを返す
   * 未生成だったら生成したのちに返す。
   * sharpの処理キューが4以上だったらエラーを返す（呼び出し元でリトライ）
   *
   * @param originalImagePath
   */
  public async getImageThumbPath(originalImagePath: string): Promise<string> {
    const thumbnailDirectoryPath = path.join(
      electron.app.getPath('userData'),
      './thumbnail'
    );
    if (!fs.existsSync(thumbnailDirectoryPath)) {
      fs.mkdirSync(thumbnailDirectoryPath);
    }

    const thumbFilePath = `${thumbnailDirectoryPath}/${crypto
      .createHash('md5')
      .update(path.basename(originalImagePath))
      .digest('hex')}`;
    if (!fs.existsSync(thumbFilePath)) {
      const counter = sharp.counters();
      // sharpの処理キューが溜まってたら作成遅延の原因になるので受け付けない(呼び出し側でリトライする)
      if (counter.queue > 4) {
        throw new Error('queue is busy');
      }
      const start = performance.now();
      await sharp(originalImagePath)
        .resize(640, 360, { fit: 'cover' })
        .webp()
        .toFile(thumbFilePath);
      const end = performance.now();
      console.log(
        `generate:${end - start}ms, queue:${counter.queue}, process:${
          counter.process
        }`
      );
    }

    return path.resolve(thumbFilePath);
  }

  /**
   * サムネイル画像が保存されているディレクトリパスを取得
   */
  async getThumbnailDirectoryPath(): Promise<string> {
    return path.join(electron.app.getPath('userData'), './thumbnail');
  }
}
