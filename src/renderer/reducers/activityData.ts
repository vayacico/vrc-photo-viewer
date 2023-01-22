import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorResponse, PhotoData, PhotoResponse } from '../../dto/ActivityLog';

export type ActivityDataState = {
  photo: PhotoData[] | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  selectedPhotoIndex: number | null;
};

const initialState: ActivityDataState = {
  photo: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  selectedPhotoIndex: 0,
};

export const getActivity = createAsyncThunk<PhotoResponse | ErrorResponse>(
  'get/activity',
  async () => {
    return window.service.log.getPhotos();
  }
);

const slice = createSlice({
  name: 'ACTIVITY_DATA',
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
    clear: (state) => {
      state.photo = [];
      return state;
    },
    reset: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getActivity.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.errorMessage = null;
      return state;
    });
    builder.addCase(getActivity.fulfilled, (state, action) => {
      if (action.payload.status === 'success') {
        state.photo = action.payload.data;
        state.isLoading = false;
        return state;
      }
      state.errorMessage = action.payload.message;
      state.isLoading = false;
      state.isError = true;
      return state;
    });
  },
});

export const imageGalleryActions = slice.actions;
const imageGalleryReducer = slice.reducer;
export default imageGalleryReducer;
