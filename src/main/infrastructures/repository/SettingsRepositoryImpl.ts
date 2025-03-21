import ElectronStore from 'electron-store';
import SettingRepository from '../../domain/model/SettingRepository';

type SettingType = {
  db: string;
  dbList: string[];
  photo: string[];
};

export default class SettingsRepositoryImpl implements SettingRepository {
  store: ElectronStore<SettingType>;

  constructor() {
    this.store = new ElectronStore<SettingType>();
  }

  /**
   * 言語設定を更新
   * @param lng
   */
  async updateLanguage(lng: 'ja' | 'en'): Promise<void> {
    this.store.set('language', lng);
  }

  /**
   * 言語設定を取得
   */
  async getLanguage(): Promise<'ja' | 'en'> {
    try {
      const result = this.store.get('language') as 'ja' | 'en';
      if (result === 'ja' || result === 'en') {
        return result;
      }
      return 'ja';
    } catch (e) {
      return 'en';
    }
  }

  /**
   * アプリケーション設定ファイルの場所を取得
   */
  async getSettingFileLocation(): Promise<string> {
    return this.store.path;
  }

  /**
   * 設定されているActivityLogToolsのパスを取得
   */
  async getDbFileLocation(): Promise<string[]> {
    const dbPathList = this.store.get('dbList');
    if (dbPathList) {
      return dbPathList;
    }

    // 旧バージョンで設定されている場合はそのパスを返す
    const oldDbPath = this.store.get('db');
    if (oldDbPath) {
      return [oldDbPath];
    }
    return [];
  }

  /**
   * 設定されている写真格納ディレクトリの場所を取得
   */
  async getPhotoDirectoryLocations(): Promise<string[]> {
    try {
      return this.store.get('photo') ?? [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 写真格納ディレクトリの場所を更新
   * @param paths
   */
  async updatePhotoDirectoryLocations(paths: string[]): Promise<void> {
    this.store.set('photo', paths);
  }

  /**
   * ActivityLogToolsのパスを設定
   * @param path
   */
  async updateDbFileLocation(path: string[]): Promise<void> {
    this.store.set('dbList', path);
  }
}
