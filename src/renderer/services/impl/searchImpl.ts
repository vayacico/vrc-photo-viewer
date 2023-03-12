import SearchService from '../search';
import {
  ErrorResponse,
  PhotoResponse,
  WorldResponse,
} from '../../../dto/ActivityLog';

export default class SearchServiceImpl implements SearchService {
  getUserSuggestion(keyword: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  getWorldSuggestion(keyword: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  searchPhotoByUserName(
    keyword: string
  ): Promise<PhotoResponse | ErrorResponse> {
    return Promise.resolve({ status: 'success', data: [] });
  }

  searchPhotoByWorldName(
    keyword: string
  ): Promise<PhotoResponse | ErrorResponse> {
    return Promise.resolve({ status: 'success', data: [] });
  }

  searchWorldByUserName(
    keyword: string
  ): Promise<WorldResponse | ErrorResponse> {
    return Promise.resolve({ status: 'success', data: [] });
  }

  searchWorldByWorldName(
    keyword: string
  ): Promise<WorldResponse | ErrorResponse> {
    return Promise.resolve({ status: 'success', data: [] });
  }
}
