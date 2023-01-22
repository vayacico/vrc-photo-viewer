import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StatusState = {
  text: string;
};

const initialState: StatusState = {
  text: '',
};

const slice = createSlice({
  name: 'STATUS',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<StatusState>) => {
      state.text = action.payload.text;
    },
  },
});
export const statusActions = slice.actions;
const statusReducer = slice.reducer;
export default statusReducer;
