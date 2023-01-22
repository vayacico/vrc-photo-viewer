import { combineReducers, configureStore } from '@reduxjs/toolkit';
import * as reducers from './reducers';

const createStore = configureStore({
  reducer: combineReducers({ ...reducers }),
  devTools: true,
});

export default createStore;
export type AppDispatch = typeof createStore.dispatch;
