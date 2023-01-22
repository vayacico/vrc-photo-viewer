import {
  ErrorResponse,
  PhotoResponse,
  WorldResponse,
} from '../../dto/ActivityLog';

export default interface SearchService {
  searchPhotoByWorldName: (
    keyword: string
  ) => Promise<PhotoResponse | ErrorResponse>;
  searchPhotoByUserName: (
    keyword: string
  ) => Promise<PhotoResponse | ErrorResponse>;
  searchWorldByWorldName: (
    keyword: string
  ) => Promise<WorldResponse | ErrorResponse>;
  searchWorldByUserName: (
    keyword: string
  ) => Promise<WorldResponse | ErrorResponse>;
  getUserSuggestion: (keyword: string) => Promise<string[]>;
  getWorldSuggestion: (keyword: string) => Promise<string[]>;
}
