import { WorldSearchResult } from './dto/WorldSeatchResult';
import { UserLog } from './dto/UserLog';
import { UserSearchResult } from './dto/UserSearchResult';

export default interface ActivityLogRepository {
  getUserJoinLog(path: string, from: Date, to: Date): Promise<UserLog[]>;

  getAllJoinLog(path: string): Promise<WorldSearchResult[]>;

  getJoinLogByWorldName(
    path: string,
    keyword: string
  ): Promise<WorldSearchResult[]>;

  getJoinLogByUserName(
    path: string,
    keyword: string
  ): Promise<UserSearchResult[]>;

  getUserSuggestion(path: string, keyword: string): Promise<string[]>;

  getWorldSuggestion(path: string, keyword: string): Promise<string[]>;
}
