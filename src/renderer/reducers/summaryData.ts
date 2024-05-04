import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ActivityStatisticsData,
  WorldJoinStatisticsData,
  WorldTypeJoinStatisticsData,
} from '../../dto/ActivityStatisticsData';
import { ErrorResponse, UserJoinCount } from '../../dto/ActivityLog';

export type SummaryDataState = {
  date: Date;
  joinCountByWorldName: WorldJoinStatisticsData[] | null;
  joinCountByUserName: UserJoinCount[] | null;
  joinCountByInstanceType: WorldTypeJoinStatisticsData[] | null;
  activityHeatmap: ActivityStatisticsData[] | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
};

const initialState: SummaryDataState = {
  date: new Date(),
  joinCountByWorldName: null,
  joinCountByUserName: null,
  joinCountByInstanceType: null,
  activityHeatmap: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

export const getSummaryData = createAsyncThunk<
  | {
      date: Date;
      joinCountByWorldName: WorldJoinStatisticsData[] | null;
      joinCountByUserName: UserJoinCount[] | null;
      joinCountByInstanceType: WorldTypeJoinStatisticsData[] | null;
      activityHeatmap: ActivityStatisticsData[] | null;
    }
  | ErrorResponse,
  Date
>('get/summaryData', async (date) => {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  to.setHours(23, 59, 59, 999);

  const [
    joinCountByWorldName,
    joinCountByUserName,
    joinCountByInstanceType,
    activityHeatmap,
  ] = await Promise.all([
    window.service.statistics.getWorldJoinCount(from, to),
    window.service.statistics.getUserJoinCount(from, to),
    window.service.statistics.getInstanceTypeCount(from, to),
    window.service.statistics.getActivityHeatmap(from, to),
  ]);

  if (joinCountByWorldName.status === 'failed') {
    console.error(joinCountByWorldName.message);
    return {
      status: joinCountByWorldName.status,
      errorCode: joinCountByWorldName.errorCode,
      message: joinCountByWorldName.message,
    } as ErrorResponse;
  }
  if (joinCountByUserName.status === 'failed') {
    console.error(joinCountByUserName.message);
    return {
      status: joinCountByUserName.status,
      errorCode: joinCountByUserName.errorCode,
      message: joinCountByUserName.message,
    } as ErrorResponse;
  }
  if (joinCountByInstanceType.status === 'failed') {
    console.error(joinCountByInstanceType.message);
    return {
      status: joinCountByInstanceType.status,
      errorCode: joinCountByInstanceType.errorCode,
      message: joinCountByInstanceType.message,
    } as ErrorResponse;
  }
  if (activityHeatmap.status === 'failed') {
    console.error(activityHeatmap.message);
    return {
      status: activityHeatmap.status,
      errorCode: activityHeatmap.errorCode,
      message: activityHeatmap.message,
    } as ErrorResponse;
  }
  return {
    date: from,
    joinCountByWorldName: joinCountByWorldName.data,
    joinCountByUserName: joinCountByUserName.data,
    joinCountByInstanceType: joinCountByInstanceType.data,
    activityHeatmap: activityHeatmap.data,
  };
});

const slice = createSlice({
  name: 'SUMMARY_DATA',
  initialState,
  reducers: {
    reset: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSummaryData.pending, (state) => {
      state.isError = false;
      state.errorMessage = null;
      state.isLoading = true;
      return state;
    });
    builder.addCase(getSummaryData.fulfilled, (state, action) => {
      if ('status' in action.payload) {
        state.isError = true;
        state.errorMessage = action.payload.message;
        state.isLoading = false;
        return state;
      }
      state.date = action.payload.date;
      state.joinCountByWorldName = action.payload.joinCountByWorldName;
      state.joinCountByUserName = action.payload.joinCountByUserName;
      state.joinCountByInstanceType = action.payload.joinCountByInstanceType;
      state.activityHeatmap = action.payload.activityHeatmap;
      state.isLoading = false;
      return state;
    });
  },
});
export const summaryDataActions = slice.actions;
const summaryDataReducer = slice.reducer;

export default summaryDataReducer;
