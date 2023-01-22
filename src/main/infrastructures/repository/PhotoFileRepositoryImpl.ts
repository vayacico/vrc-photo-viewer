import fs from 'fs';
import path from 'path';
import PhotoFileRepository from '../../domain/model/PhotoFileRepository';
import { PhotoFile } from '../../domain/model/dto/PhotoFile';

export default class PhotoFileRepositoryImpl implements PhotoFileRepository {
  /**
   * 指定されたディレクトリ配下の写真のパスリストを取得
   * @param directoryPaths ディレクトリリスト
   */
  async getPhotoFilePathList(directoryPaths: string[]): Promise<string[]> {
    // 指定されたディレクトリ配下のファイルを再帰的に取得
    const filePathList = (
      await Promise.all(
        directoryPaths.map((directoryPath) =>
          this.getFilePathList(directoryPath)
        )
      )
    ).flat();

    // フィルターして返す
    return filePathList.filter((file) => {
      // とりあえずはPNGとJPGファイルだけを対象とする
      return file.endsWith('.png') || file.endsWith('.jpg');
    });
  }

  /**
   * 指定されたファイルの情報を取得する
   * @param paths ファイルパスのリスト
   */
  async getFileStatsList(paths: string[]): Promise<PhotoFile[]> {
    // ファイル情報を取得
    return Promise.all(
      paths.map((filePath) => {
        return this.getFileStats(filePath);
      })
    );
  }

  private async getFilePathList(root: string): Promise<string[]> {
    const children = await fs.promises.readdir(root, { withFileTypes: true });
    return (
      await Promise.all(
        children.map((child) => {
          const filePath = path.join(root, child.name);
          if (child.isDirectory()) {
            return this.getFilePathList(filePath);
          }
          return Promise.resolve([filePath]);
        })
      )
    ).flat();
  }

  private async getFileStats(filePath: string): Promise<PhotoFile> {
    const { mtime } = await fs.promises.stat(filePath);
    return {
      originalFilePath: filePath,
      createdDate: mtime,
    };
  }
}
