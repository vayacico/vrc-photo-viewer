import LogService from './log';
import ThumbnailService from './thumbnail';
import SettingService from './settings';
import ApplicationService from './application';
import SearchService from './search';
import StatisticsService from './statistics';

declare global {
  interface Window {
    service: {
      log: LogService;
      search: SearchService;
      thumbnail: ThumbnailService;
      statistics: StatisticsService;
      settings: SettingService;
      application: ApplicationService;
    };
  }
}
