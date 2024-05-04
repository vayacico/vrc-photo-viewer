import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { State } from '../reducers';
import Summary from '../component/summary/Summary';
import { AppDispatch } from '../createStore';
import { getSummaryData } from '../reducers/summaryData';
import { InstanceType, WeekDay } from '../../dto/ActivityStatisticsData';
import { pageModeActions } from '../reducers/pageMode';

const SummaryContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const summaryData = useSelector((state: State) => state.summary);
  const dateRef = useRef<Date>(summaryData.date);
  dateRef.current = summaryData.date;

  const setDate = (date: Date) => {
    dispatch(getSummaryData(date));
  };

  const linkToSearchPage = (param: {
    worldName?: string;
    instanceType?: InstanceType;
    dayOfWeek?: WeekDay;
    hour?: number;
  }) => {
    let query = ` since:${moment(dateRef.current)
      .startOf('month')
      .format('YYYY-MM-DD')} until:${moment(dateRef.current)
      .endOf('month')
      .format('YYYY-MM-DD')}`;
    if (param.worldName) {
      query = param.worldName + query;
    }
    if (param.instanceType) {
      query += ` instanceType:${param.instanceType.toLowerCase()}`;
    }
    if (param.dayOfWeek) {
      query += ` dayOfWeek:${param.dayOfWeek.toLowerCase()}`;
    }
    if (param.hour !== undefined) {
      if (param.hour === 23) {
        const fromTime = `${`0${param.hour}`.slice(-2)}:00`;
        query += ` sinceTime:${fromTime}`;
      } else {
        const fromTime = `${`0${param.hour}`.slice(-2)}:00`;
        const toTime = `${`0${param.hour + 1}`.slice(-2)}:00`;
        query += ` sinceTime:${fromTime} untilTime:${toTime}`;
      }
    }

    dispatch(
      pageModeActions.replace({
        mode: 'SEARCH',
        searchWord: query,
      })
    );
  };

  return (
    <Summary
      date={summaryData.date}
      setDate={(date) => setDate(date)}
      joinCount={summaryData.joinCountByWorldName?.length ?? null}
      encounterCount={summaryData.joinCountByUserName?.length ?? null}
      joinCountByWorldName={summaryData.joinCountByWorldName}
      joinCountByInstanceType={summaryData.joinCountByInstanceType}
      activityHeatmap={summaryData.activityHeatmap}
      linkToSearchPage={linkToSearchPage}
    />
  );
};
export default SummaryContainer;
