import * as electron from 'electron';
import { dialog } from 'electron';
import SettingsRepositoryImpl from '../infrastructures/repository/SettingsRepositoryImpl';
import SettingRepository from '../domain/model/SettingRepository';
import { SettingForm } from '../../dto/SettingForm';
import ActivityLogRepository from '../domain/model/ActivityLogRepository';
import ActivityLogRepositoryImpl from '../infrastructures/repository/ActivityLogRepositoryImpl';

export default class FileSettingsService {
  settingRepository: SettingRepository;

  activityLogRepository: ActivityLogRepository;

  constructor() {
    this.settingRepository = new SettingsRepositoryImpl();
    this.activityLogRepository = new ActivityLogRepositoryImpl();
  }

  /**
   * 設定ファイルをOSで開く
   */
  async openSettingFile(): Promise<void> {
    const filePath = await this.settingRepository.getSettingFileLocation();
    await electron.shell.openPath(filePath);
  }

  /**
   * 設定されているDBファイルのパスを取得する
   */
  async getDbFileLocation(): Promise<string> {
    return this.settingRepository.getDbFileLocation();
  }

  /**
   * 設定されている写真のディレクトリリストを取得する
   */
  async getPhotoDirectoryLocations(): Promise<string[]> {
    return this.settingRepository.getPhotoDirectoryLocations();
  }

  /**
   * 設定値のチェックと更新を行う。利用不可なパスの場合は例外を投げる。
   * @param settingForm
   */
  async applySetting(settingForm: SettingForm): Promise<void> {
    // 読み込みのテストを行う(発生した例外はインターフェイス層で補足してレスポンスに変換)
    await this.activityLogRepository.getAllJoinLog(
      settingForm.databaseFilePath
    );

    // 設定値の書き込み
    await this.settingRepository.updatePhotoDirectoryLocations(
      settingForm.imageDirectoryPaths
    );
    await this.settingRepository.updateDbFileLocation(
      settingForm.databaseFilePath
    );

    return Promise.resolve(undefined);
  }

  /**
   * DBファイル選択ダイアログを表示。選択されたパスを返す。未選択の場合はnull
   */
  async selectDatabaseFileLocation(): Promise<string | null> {
    const pathes = dialog.showOpenDialogSync({
      title: 'DB File Location',
      properties: ['openFile'],
    });

    if (pathes && pathes.length > 0) {
      return pathes[0];
    }

    return null;
  }

  /**
   * ディレクトリ選択ダイアログを表示。選択されたパスを返す。未選択の場合はnull
   */
  async selectPhotoDirectoryLocation(): Promise<string | null> {
    const pathes = dialog.showOpenDialogSync({
      title: 'Photo File Directory',
      properties: ['openDirectory'],
    });

    if (pathes && pathes.length > 0) {
      return pathes[0];
    }

    return null;
  }
}
