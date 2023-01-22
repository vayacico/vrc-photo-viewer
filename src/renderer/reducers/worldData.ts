import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ErrorResponse, WorldData, WorldResponse } from '../../dto/ActivityLog';

export type WorldDataState = {
  world: WorldData[] | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
};

const initialState: WorldDataState = {
  world: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

export const getWorld = createAsyncThunk<WorldResponse | ErrorResponse>(
  'get/world',
  async () => {
    return window.service.log.getWorlds();
  }
);

const slice = createSlice({
  name: 'WORLD_DATA',
  initialState,
  reducers: {
    clear: (state) => {
      state.world = [];
      return state;
    },
    reset: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorld.pending, (state) => {
      state.isError = false;
      state.errorMessage = null;
      state.isLoading = true;
      return state;
    });
    builder.addCase(getWorld.fulfilled, (state, action) => {
      if (action.payload.status === 'success') {
        state.isLoading = false;
        state.world = action.payload.data;
        return state;
      }
      state.isError = true;
      state.errorMessage = action.payload.message;
      state.isLoading = false;
      return state;
    });
  },
});
export const worldDataActions = slice.actions;
const worldDataReducer = slice.reducer;
export default worldDataReducer;
