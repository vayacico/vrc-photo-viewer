import { ActivityDataState } from './activityData';
import { PageModeState } from './pageMode';
import { WorldDataState } from './worldData';
import { SearchResultState } from './searchResult';
import { StatusState } from './status';
import { SummaryDataState } from './summaryData';

export { default as imageGallery } from './activityData';
export { default as worldData } from './worldData';
export { default as pageMode } from './pageMode';
export { default as searchResult } from './searchResult';
export { default as status } from './status';
export { default as summary } from './summaryData';

export interface State {
  imageGallery: ActivityDataState;
  searchResult: SearchResultState;
  worldData: WorldDataState;
  summary: SummaryDataState;
  pageMode: PageModeState;
  status: StatusState;
}
