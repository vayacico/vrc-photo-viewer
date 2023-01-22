import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ErrorResponse,
  PhotoData,
  PhotoResponse,
  WorldData,
  WorldResponse,
} from '../../dto/ActivityLog';

export type SearchResultState = {
  type: 'photo' | 'world';
  photo: PhotoData[];
  world: WorldData[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  selectedPhotoIndex: number | null;
};

const initialState: SearchResultState = {
  type: 'photo',
  photo: [],
  world: [],
  isLoading: false,
  isError: false,
  errorMessage: null,
  selectedPhotoIndex: 0,
};

export const searchWorldByWorldName = createAsyncThunk<
  WorldResponse | ErrorResponse,
  string
>('search/worldByWorldName', async (keyword: string) => {
  return window.service.search.searchWorldByWorldName(keyword);
});
export const searchWorldByUserName = createAsyncThunk<
  WorldResponse | ErrorResponse,
  string
>('search/worldByUserName', async (keyword: string) => {
  return window.service.search.searchWorldByUserName(keyword);
});
export const searchPhotoByUserName = createAsyncThunk<
  PhotoResponse | ErrorResponse,
  string
>('search/photoByUserName', async (keyword: string) => {
  return window.service.search.searchPhotoByUserName(keyword);
});
export const searchPhotoByWorldName = createAsyncThunk<
  PhotoResponse | ErrorResponse,
  string
>('search/photoByWorldName', async (keyword: string) => {
  return window.service.search.searchPhotoByWorldName(keyword);
});

const slice = createSlice({
  name: 'SEARCH_RESULT_DATA',
  initialState,
  reducers: {
    setSelected: (
      state,
      action: PayloadAction<{
        selectedPhotoIndex: number | null;
      }>
    ) => {
      return {
        ...state,
        selectedPhotoIndex: action.payload.selectedPhotoIndex,
      };
    },
    reset: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(searchWorldByWorldName.pending, (state) => {
      state.isError = false;
      state.errorMessage = null;
      state.isLoading = true;
      return state;
    });
    builder.addCase(searchWorldByUserName.pending, (state) => {
      state.isError = false;
      state.errorMessage = null;
      state.isLoading = true;
      return state;
    });
    builder.addCase(searchPhotoByWorldName.pending, (state) => {
      state.isError = false;
      state.errorMessage = null;
      state.isLoading = true;
      return state;
    });
    builder.addCase(searchPhotoByUserName.pending, (state) => {
      state.isError = false;
      state.errorMessage = null;
      state.isLoading = true;
      return state;
    });

    builder.addCase(searchWorldByWorldName.fulfilled, (state, action) => {
      if (action.payload.status === 'success') {
        state.isLoading = false;
        state.type = 'world';
        state.world = action.payload.data;
        return state;
      }
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      return state;
    });
    builder.addCase(searchWorldByUserName.fulfilled, (state, action) => {
      if (action.payload.status === 'success') {
        state.isLoading = false;
        state.type = 'world';
        state.world = action.payload.data;
        return state;
      }
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      return state;
    });
    builder.addCase(searchPhotoByWorldName.fulfilled, (state, action) => {
      if (action.payload.status === 'success') {
        state.isLoading = false;
        state.type = 'photo';
        state.photo = action.payload.data;
        return state;
      }
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      return state;
    });
    builder.addCase(searchPhotoByUserName.fulfilled, (state, action) => {
      if (action.payload.status === 'success') {
        state.isLoading = false;
        state.type = 'photo';
        state.photo = action.payload.data;
        return state;
      }
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      return state;
    });
  },
});

export const searchResultActions = slice.actions;
const SearchResultReducer = slice.reducer;
export default SearchResultReducer;
