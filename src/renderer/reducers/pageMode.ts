import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PageModeState = {
  current: PageMode;
  history: PageMode[];
};

export type Mode =
  | 'GALLERY'
  | 'WORLD'
  | 'PHOTO_DETAIL_FOR_GALLERY'
  | 'PHOTO_DETAIL_FOR_SEARCH'
  | 'SEARCH'
  | 'SETTING';

export type PageMode = {
  mode: Mode;
  errorMessage?: string;
  scrollInstanceId?: string | null;
};

const initialState: PageModeState = {
  current: {
    mode: 'GALLERY',
  },
  history: [],
};

const slice = createSlice({
  name: 'PAGE_MODE',
  initialState,
  reducers: {
    back: (state) => {
      const previous = state.history.pop();
      if (previous) {
        state.current = previous;
      }
    },
    replace: (state, action: PayloadAction<PageMode>) => {
      // モード変更時に履歴に積む
      if (state.current.mode !== action.payload.mode) {
        state.history.push({ ...state.current, scrollInstanceId: null });
      }
      if (action.payload.mode !== 'GALLERY') {
        state.current = { ...action.payload, scrollInstanceId: null };
      } else {
        state.current = action.payload;
      }
      return state;
    },
    clearInstanceId: (state) => {
      state.current.scrollInstanceId = null;
      return state;
    },
    reset: (state) => {
      // eslint-disable-next-line no-param-reassign
      state = initialState;
      return state;
    },
  },
});
export const pageModeActions = slice.actions;
const pageModeReducer = slice.reducer;
export default pageModeReducer;
