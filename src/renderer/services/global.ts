import LogService from './log';
import ThumbnailService from './thumbnail';
import SettingService from './settings';
import ApplicationService from './application';
import SearchService from './search';

declare global {
  interface Window {
    service: {
      log: LogService;
      search: SearchService;
      thumbnail: ThumbnailService;
      settings: SettingService;
      application: ApplicationService;
    };
    environment: 'electron' | 'browser';
  }
}
