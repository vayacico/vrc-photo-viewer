import * as electron from 'electron';
import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import i18next from 'i18next';
import {
  ErrorResponse,
  PhotoCountResponse,
  PhotoResponse,
  UserJoinCountResponse,
  WorldData,
  WorldJoinCountResponse,
  WorldResponse,
} from '../../dto/ActivityLog';
import ActivityService from '../application/ActivityService';
import ThumbnailService from '../application/ThumbnailService';
import SettingsService from '../application/SettingsService';
import DatabaseErrorException from '../domain/model/exception/DatabaseErrorException';
import { ApplyResponse, SettingForm } from '../../dto/SettingForm';
import DatabaseFilePathNotSetException from '../domain/model/exception/DatabaseFilePathNotSetException';
import PhotoDirectoryNotSetException from '../domain/model/exception/PhotoDirectoryNotSetException';
import { ScanResultResponse } from '../../dto/ScanResult';
import StatisticsService from '../application/StatisticsService';
import {
  ActivityStaticsDataResponse,
  WorldTypeJoinStatisticsDataResponse,
} from '../../dto/ActivityStatisticsData';
import BrowserWindow = Electron.BrowserWindow;

/**
 * IPC通信のハンドラを登録
 * @param browserWindow
 */
const registerHandler = (browserWindow: BrowserWindow | null) => {
  const activityService = new ActivityService();
  const statisticsService = new StatisticsService();
  const thumbnailService = new ThumbnailService();
  const settingService = new SettingsService();

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../../assets');
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // 写真リスト取得
  ipcMain.handle('GET_PHOTOS', async () => {
    try {
      const photoLog = await activityService.getPhotos();
      return {
        status: 'success',
        data: photoLog.map((log) => {
          return {
            createdDate: log.createdDate,
            joinDate: log.joinDate,
            estimateLeftDate: log.estimateLeftDate,
            originalFilePath: log.originalFilePath,
            instanceId: log.instanceId,
            worldName: log.worldName,
          };
        }),
      } as PhotoResponse;
    } catch (e) {
      console.log(e);
      if (e instanceof DatabaseFilePathNotSetException) {
        return {
          status: 'failed',
          errorCode: 'FILE_NOT_SET',
          message: i18next.t('error.dbFileNotSet'),
        } as ErrorResponse;
      }
      if (e instanceof PhotoDirectoryNotSetException) {
        return {
          status: 'failed',
          errorCode: 'DIRECTORY_NOT_SET',
          message: i18next.t('error.directoryNotSet'),
        } as ErrorResponse;
      }
      if (e instanceof DatabaseErrorException) {
        return {
          status: 'failed',
          errorCode: 'FILE_INVALID',
          message: e.message,
        } as ErrorResponse;
      }
      return {
        status: 'failed',
        errorCode: 'UNKNOWN',
        message: `${e}`,
      } as ErrorResponse;
    }
  });
  // 写真スキャン開始
  ipcMain.handle('SCAN_PHOTOS', async (_event, reflesh: boolean) => {
    try {
      const result = await activityService.scanPhoto(reflesh);
      return {
        status: 'success',
        oldPhotoCount: result.oldPhotoCount,
        photoCount: result.photoCount,
      } as ScanResultResponse;
    } catch (e) {
      console.log(e);
      if (e instanceof DatabaseErrorException) {
        return {
          status: 'failed',
          errorCode: 'FILE_INVALID',
          message: e.message,
        } as ErrorResponse;
      }
      return {
        status: 'failed',
        errorCode: 'UNKNOWN',
        message: `${e}`,
      } as ErrorResponse;
    }
  });
  // ユーザーリスト取得
  ipcMain.handle('GET_USERS', async (_event, from: Date, to: Date) => {
    try {
      return await activityService.getUsers(from, to);
    } catch (e) {
      if (e instanceof DatabaseErrorException) {
        console.log(e);
        return {
          status: 'failed',
          errorCode: 'FILE_INVALID',
          message: e.message,
        } as ErrorResponse;
      }
      return {
        status: 'failed',
        errorCode: 'UNKNOWN',
        message: `${e}`,
      } as ErrorResponse;
    }
  });
  // ワールドリスト取得
  ipcMain.handle('GET_WORLDS', async () => {
    try {
      const worlds = await activityService.getWorlds();
      return {
        status: 'success',
        data: worlds.map((world) => {
          return {
            instanceId: world.instanceId,
            worldName: world.worldName,
            joinDate: world.joinDate,
            estimateLeftDate: world.estimateLeftDate,
          } as WorldData;
        }),
      } as WorldResponse;
    } catch (e) {
      console.log(e);
      if (e instanceof DatabaseFilePathNotSetException) {
        return {
          status: 'failed',
          errorCode: 'FILE_NOT_SET',
          message: i18next.t('error.dbFileNotSet'),
        } as ErrorResponse;
      }
      if (e instanceof DatabaseErrorException) {
        return {
          status: 'failed',
          errorCode: 'FILE_INVALID',
          message: e.message,
        } as ErrorResponse;
      }
      if (e instanceof PhotoDirectoryNotSetException) {
        return {
          status: 'failed',
          errorCode: 'DIRECTORY_NOT_SET',
          message: i18next.t('error.directoryNotSet'),
        } as ErrorResponse;
      }
      return {
        status: 'failed',
        errorCode: 'UNKNOWN',
        message: `${e}`,
      } as ErrorResponse;
    }
  });
  // 写真検索（ワールド名）
  ipcMain.handle(
    'SEARCH_PHOTO_BY_WORLD_NAME',
    async (_event, keyword: string) => {
      try {
        const worlds = await activityService.searchPhotosByWorldName(keyword);
        return {
          status: 'success',
          data: worlds.map((log) => {
            return {
              createdDate: log.createdDate,
              joinDate: log.joinDate,
              estimateLeftDate: log.estimateLeftDate,
              originalFilePath: log.originalFilePath,
              instanceId: log.instanceId,
              worldName: log.worldName,
            };
          }),
        } as PhotoResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // 写真検索（ユーザー名）
  ipcMain.handle(
    'SEARCH_PHOTO_BY_USER_NAME',
    async (_event, keyword: string) => {
      try {
        const worlds = await activityService.searchPhotosByUserName(keyword);
        return {
          status: 'success',
          data: worlds.map((log) => {
            return {
              createdDate: log.createdDate,
              joinDate: log.joinDate,
              estimateLeftDate: log.estimateLeftDate,
              originalFilePath: log.originalFilePath,
              instanceId: log.instanceId,
              worldName: log.worldName,
            };
          }),
        } as PhotoResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // ワールド検索（ユーザー名）
  ipcMain.handle(
    'SEARCH_WORLD_BY_USER_NAME',
    async (_event, keyword: string) => {
      try {
        const worlds = await activityService.searchWorldsByUserName(keyword);
        return {
          status: 'success',
          data: worlds.map((log) => {
            return {
              joinDate: log.joinDate,
              estimateLeftDate: log.estimateLeftDate,
              instanceId: log.instanceId,
              worldName: log.worldName,
            };
          }),
        } as WorldResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // ワールド検索（ワールド名）
  ipcMain.handle(
    'SEARCH_WORLD_BY_WORLD_NAME',
    async (_event, keyword: string) => {
      try {
        const worlds = await activityService.searchWorldsByWorldName(keyword);
        return {
          status: 'success',
          data: worlds.map((log) => {
            return {
              joinDate: log.joinDate,
              estimateLeftDate: log.estimateLeftDate,
              instanceId: log.instanceId,
              worldName: log.worldName,
            };
          }),
        } as WorldResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // ユーザー名サジェストを取得
  ipcMain.handle('GET_USER_SUGGESTION', (_event, keyword: string) => {
    return activityService.getUserSuggestion(keyword);
  });
  // ワールド名サジェストを取得
  ipcMain.handle('GET_WORLD_SUGGESTION', (_event, keyword: string) => {
    return activityService.getWorldSuggestion(keyword);
  });
  // ワールドごとの訪問数を取得
  ipcMain.handle(
    'GET_STATISTICS_WORLD_JOIN_COUNT',
    async (_event, from: Date, to: Date) => {
      try {
        return {
          status: 'success',
          data: await statisticsService.getWorldJoinedCount(from, to),
        } as WorldJoinCountResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseFilePathNotSetException) {
          return {
            status: 'failed',
            errorCode: 'FILE_NOT_SET',
            message: i18next.t('error.dbFileNotSet'),
          } as ErrorResponse;
        }
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // ユーザーごとのJoin回数を取得
  ipcMain.handle(
    'GET_STATISTICS_USER_JOIN_COUNT',
    async (_event, from: Date, to: Date) => {
      try {
        return {
          status: 'success',
          data: await statisticsService.getUserJoinedCount(from, to),
        } as UserJoinCountResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseFilePathNotSetException) {
          return {
            status: 'failed',
            errorCode: 'FILE_NOT_SET',
            message: i18next.t('error.dbFileNotSet'),
          } as ErrorResponse;
        }
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // 写真の撮影枚数を取得
  ipcMain.handle(
    'GET_STATISTICS_PHOTO_COUNT',
    async (_event, from: Date, to: Date) => {
      try {
        const photoCount = await statisticsService.getPhotoTakenCount(from, to);
        return {
          status: 'success',
          count: photoCount,
        } as PhotoCountResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseFilePathNotSetException) {
          return {
            status: 'failed',
            errorCode: 'FILE_NOT_SET',
            message: i18next.t('error.dbFileNotSet'),
          } as ErrorResponse;
        }
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // アクティビティのヒートマップを取得
  ipcMain.handle(
    'GET_STATISTICS_ACTIVITY_HEAT_MAP',
    async (_event, from: Date, to: Date) => {
      try {
        const heatMap = await statisticsService.getActivityCountMap(from, to);
        return {
          status: 'success',
          data: heatMap,
        } as ActivityStaticsDataResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseFilePathNotSetException) {
          return {
            status: 'failed',
            errorCode: 'FILE_NOT_SET',
            message: i18next.t('error.dbFileNotSet'),
          } as ErrorResponse;
        }
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // インスタンスタイプごとの訪問数を取得
  ipcMain.handle(
    'GET_STATISTICS_INSTANCE_TYPE_COUNT',
    async (_event, from: Date, to: Date) => {
      try {
        const data = await statisticsService.getInstancesTypeCount(from, to);
        return {
          status: 'success',
          data,
        } as WorldTypeJoinStatisticsDataResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseFilePathNotSetException) {
          return {
            status: 'failed',
            errorCode: 'FILE_NOT_SET',
            message: i18next.t('error.dbFileNotSet'),
          } as ErrorResponse;
        }
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            errorCode: 'FILE_INVALID',
            message: e.message,
          } as ErrorResponse;
        }
        return {
          status: 'failed',
          errorCode: 'UNKNOWN',
          message: `${e}`,
        } as ErrorResponse;
      }
    }
  );
  // サムネイルディレクトリオープン
  ipcMain.handle('OPEN_THUMBNAIL_DIRECTORY', async (_event) => {
    return thumbnailService.openThumbnailDirectory();
  });
  // サムネイル取得
  ipcMain.handle('GET_THUMBNAIL', async (_event, originalFilePath: string) => {
    return thumbnailService.getThumbnail(originalFilePath);
  });
  // 設定ファイルオープン
  ipcMain.handle('OPEN_SETTING_FILE_LOCATION', async () => {
    return settingService.openSettingFile();
  });
  // DBファイルロケーション取得
  ipcMain.handle('GET_DB_LOCATION', async () => {
    return settingService.getDbFileLocation();
  });
  // 写真ファイルロケーションリスト取得
  ipcMain.handle('GET_PHOTO_LOCATIONS', async () => {
    return settingService.getPhotoDirectoryLocations();
  });
  // DB選択ダイアログ表示
  ipcMain.handle('SELECT_DB_LOCATION', async () => {
    return settingService.selectDatabaseFileLocation();
  });
  // フォルダ選択ダイアログ表示
  ipcMain.handle('SELECT_PHOTO_LOCATIONS', async () => {
    return settingService.selectPhotoDirectoryLocation();
  });
  // ファイル設定変更
  ipcMain.handle(
    'UPDATE_FILE_SETTING',
    async (_event, settingForm: SettingForm) => {
      try {
        await settingService.applySetting(settingForm);
        return {
          status: 'success',
          message: 'success',
        } as ApplyResponse;
      } catch (e) {
        console.log(e);
        if (e instanceof DatabaseErrorException) {
          return {
            status: 'failed',
            message: e.message,
          } as ApplyResponse;
        }
        return {
          status: 'failed',
          message: i18next.t('error.unknown'),
        } as ApplyResponse;
      }
    }
  );
  // 言語設定取得
  ipcMain.handle('GET_LANGUAGE', async () => {
    return settingService.getLanguageSetting();
  });
  // 言語設定変更
  ipcMain.handle('UPDATE_LANGUAGE', async (_event, lng: 'ja' | 'en') => {
    return settingService.updateLanguageSetting(lng);
  });
  // URLをブラウザで開く
  ipcMain.handle('APPLICATION_OPEN_IN_BROWSER', async (_event, url: string) => {
    await electron.shell.openExternal(url);
  });
  // ファイルを外部アプリケーションで開く
  ipcMain.handle('APPLICATION_OPEN_FILE', async (_event, filePath: string) => {
    await electron.shell.openPath(filePath);
  });
  // アプリケーション終了
  ipcMain.handle('APPLICATION_CLOSE', async () => {
    browserWindow?.close();
  });
  // ウインドウ最小化
  ipcMain.handle('WINDOW_MINIMIZE', async () => {
    browserWindow?.minimize();
  });
  // ウインドウサイズ変更
  ipcMain.handle('WINDOW_SIZE_CHANGE', async () => {
    if (browserWindow?.isMaximized()) {
      browserWindow?.unmaximize();
    } else {
      browserWindow?.maximize();
    }
  });
  // ドラッグイベント制御
  ipcMain.handle('START_DRAG', async (event, originalFilePath: string) => {
    event.sender.startDrag({
      file: originalFilePath,
      icon: await electron.nativeImage.createThumbnailFromPath(
        originalFilePath,
        {
          width: 160,
          height: 90,
        }
      ),
    });
  });
  // アプリケーションバージョンの取得
  ipcMain.handle('GET_APPLICATION_VERSION', async () => {
    try {
      return (await fs.readFile(getAssetPath('version.txt'), 'utf-8')).trim();
    } catch (e) {
      return 'unknown';
    }
  });
  // ライセンスファイルを開く
  ipcMain.handle('OPEN_LICENCE_FILE', async () => {
    // リソースファイルの場所を取得
    await electron.shell.openPath(getAssetPath('LICENCE.txt'));
  });
};

export default registerHandler;
