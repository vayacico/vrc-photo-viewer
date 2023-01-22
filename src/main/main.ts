import { app, BrowserWindow } from 'electron';
import path from 'path';
import registerHandler from './interfaces/IpcHandler';
import { resolveHtmlPath } from './util';

let mainWindow: BrowserWindow | null = null;

const debug = require('electron-debug');

if (process.env.NODE_ENV === 'development') {
  debug();
}

// ウインドウ作成関数
const createWindow = async () => {
  // リソースファイルの場所を取得
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // ウインドウ設定
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: process.env.NODE_ENV !== 'development',
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hidden',
  });
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 表示イベントのハンドラ
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });
};

// アプリケーションエントリポイント
app
  .whenReady()
  // eslint-disable-next-line promise/always-return
  .then(() => {
    createWindow();
    registerHandler(mainWindow);
  })
  .catch(console.log);
