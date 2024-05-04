import React from 'react';
import styled from 'styled-components';
import {
  Icon,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { BsFillPersonFill, BsGlobe } from 'react-icons/bs';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { renderToString } from 'react-dom/server';
import {
  ActivityStatisticsData,
  InstanceType,
  WeekDay,
  WorldJoinStatisticsData,
  WorldTypeJoinStatisticsData,
} from '../../../dto/ActivityStatisticsData';

interface Props {
  date: Date;
  setDate: (date: Date) => void;
  joinCount: number | null;
  encounterCount: number | null;
  joinCountByWorldName: WorldJoinStatisticsData[] | null;
  joinCountByInstanceType: WorldTypeJoinStatisticsData[] | null;
  activityHeatmap: ActivityStatisticsData[] | null;
  linkToSearchPage: (param: {
    worldName?: string;
    instanceType?: InstanceType;
    dayOfWeek?: WeekDay;
    hour?: number;
  }) => void;
}

const Wrapper = styled.div`
  padding: 10px 0 0 20px;
  font-size: 1.4em;
  background-color: #f5f8fa;
  height: 100%;
  overflow-y: auto;

  ::-webkit-scrollbar {
    background: white;
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #e4e7f6;
    border-radius: 20px;
  }
`;
const DateSelectArea = styled.div`
  display: flex;
`;
const DateHeading = styled.h2`
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.2em;
  font-family: '游ゴシック', system-ui;
  font-weight: 500;
  color: #64707a;

  :hover {
    color: #4d95c9;
  }
`;
const DateHiddenInput = styled.input`
  width: 0;
  height: 0;
  border-color: transparent;
`;
const PreviousMonthButton = styled.button`
  width: 0;
  height: 0;
  margin-top: 12px;
  margin-right: 8px;
  border-style: solid;
  display: inline-block;
  border-width: 8px 8px 8px 0;
  border-color: transparent #64707a transparent transparent;

  :hover {
    border-color: transparent #4d95c9 transparent transparent;
  }
`;
const NextMonthButton = styled.div`
  width: 0;
  height: 0;
  margin-top: 12px;
  margin-left: 8px;
  border-style: solid;
  display: inline-block;
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent #64707a;

  :hover {
    border-color: transparent transparent transparent #4d95c9;
  }
`;

const StatisticWrapper = styled.div`
  display: flex;
`;
const NumberStatisticWrapper = styled.div`
  width: 300px;
`;
const CardTitle = styled.h3`
  font-size: 0.8em;
  font-weight: 700;
  color: #768a9d;
  margin-top: 0;
`;
const HeatmapCardTitle = styled(CardTitle)`
  margin-bottom: -20px;
`;
const WorldVisitCountCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  height: 120px;
`;
const WorldNumberWithIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6666c4;
`;
const UserEncounteredCountCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  margin-top: 12px;
  height: 120px;
`;
const UserNumberWithIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #699a76;
`;
const CardNumber = styled.p`
  font-size: 1.8em;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 20px;
`;
const HeatmapWrapper = styled.div`
  flex-grow: 1;
`;
const HeadMapCard = styled.div`
  margin-left: 12px;
  margin-right: 12px;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
`;
const InstanceTypeCard = styled.div`
  margin-top: 12px;
  margin-right: 12px;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
`;
const MostVisitedWorldCard = styled.div`
  margin-top: 12px;
  margin-right: 12px;
  padding: 10px;
  width: 100%;
  background-color: white;
  border-radius: 10px;
`;
const MostVisitedWorldTd = styled(Td)`
  :hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const TooltipItem = styled.p`
  margin: 4px 12px 4px 12px;
`;

const instanceTypeConfig: {
  type: InstanceType;
  text: string;
  color: string;
}[] = [
  { type: 'PUBLIC', text: 'Public', color: '#EF9A9A' },
  { type: 'FRIEND_PLUS', text: 'Friend+', color: '#90CAF9' },
  { type: 'FRIEND', text: 'Friend', color: '#A5D6A7' },
  { type: 'INVITE_PLUS', text: 'Invite+', color: '#FFF59D' },
  { type: 'INVITE', text: 'Invite', color: '#CE93D8' },
  { type: 'GROUP', text: 'Group', color: '#FFCC80' },
  { type: 'GROUP_PLUS', text: 'Group+', color: '#B0BEC5' },
  { type: 'GROUP_PUBLIC', text: 'Group public', color: '#F48FB1' },
];

const HeatmapDateConfig: { weekDay: WeekDay; text: string }[] = [
  { weekDay: 'Sunday', text: 'Sun' },
  { weekDay: 'Saturday', text: 'Sat' },
  { weekDay: 'Friday', text: 'Fri' },
  { weekDay: 'Thursday', text: 'Thu' },
  { weekDay: 'Wednesday', text: 'Wed' },
  { weekDay: 'Tuesday', text: 'Tue' },
  { weekDay: 'Monday', text: 'Mon' },
];

const Summary: React.FC<Props> = (props) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const onDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const datePickerValue = new Date(e.target.value);
    if (datePickerValue) {
      props.setDate(datePickerValue);
    }
  };

  const showDatePicker = () => {
    inputRef.current?.showPicker();
  };

  const onPreviousMonthButtonClick = () => {
    props.setDate(
      new Date(props.date.getFullYear(), props.date.getMonth() - 1)
    );
  };

  const onNextMonthButtonClick = () => {
    props.setDate(
      new Date(props.date.getFullYear(), props.date.getMonth() + 1)
    );
  };

  // ヒートマップのデータ
  const dummyDays = Array.from({ length: 24 }, () => 0).map((_, index) => {
    return { x: index, y: 0 };
  });
  const heatmapData = HeatmapDateConfig.map((week) => {
    return props.activityHeatmap !== null && props.activityHeatmap.length > 0
      ? {
          name: week.text,
          data:
            props.activityHeatmap
              .find((data) => data.dayOfWeek === week.weekDay)
              ?.countByHour.map((value, index) => {
                return { x: index, y: value.log + value.photo };
              }) ?? dummyDays,
        }
      : { name: week.text, data: dummyDays };
  });

  // ヒートマップの表示設定
  const heatmapOptions: ApexOptions = {
    chart: {
      type: 'heatmap',
      height: 350,
      animations: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      events: {
        dataPointSelection: (_event, _chart, config) => {
          props.linkToSearchPage({
            dayOfWeek: HeatmapDateConfig[config.seriesIndex].weekDay ?? null,
            hour: config.dataPointIndex,
          });
        },
      },
    },
    plotOptions: {
      heatmap: {
        distributed: true,
        shadeIntensity: 0.7,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: '#e7e7e7',
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      custom: ({ seriesIndex, dataPointIndex }) => {
        const pointData = props.activityHeatmap?.find(
          (data) => data.dayOfWeek === HeatmapDateConfig[seriesIndex].weekDay
        )?.countByHour[dataPointIndex] ?? { log: 0, photo: 0 };
        return renderToString(
          <>
            <TooltipItem>{pointData.log} log</TooltipItem>
            <TooltipItem>{pointData.photo} photo</TooltipItem>
          </>
        );
      },
    },
    states: {},
    colors: ['#1f9f00'],
    legend: {
      show: false,
    },
  };

  // 円グラフのバイト
  const instanceTypeData =
    props.joinCountByInstanceType !== null
      ? instanceTypeConfig.map((config) => {
          return (
            props.joinCountByInstanceType?.find(
              (data) => data.type === config.type
            )?.count ?? 0
          );
        })
      : [];

  // 円グラフの表示設定
  const dountChartOptions: ApexOptions = {
    labels: instanceTypeConfig.map((config) => config.text),
    colors: instanceTypeConfig.map((config) => config.color),
    chart: {
      type: 'donut',
      events: {
        dataPointSelection: (_event, _context, config) => {
          props.linkToSearchPage({
            instanceType: instanceTypeConfig[config.dataPointIndex].type,
          });
        },
      },
    },
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              formatter(w) {
                return w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const mostVisitedWorld = props.joinCountByWorldName
    ?.slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 7)
    .map((data, index) => {
      return (
        <Tr key={data.worldName}>
          <Td>{index + 1}</Td>
          <MostVisitedWorldTd
            isTruncated
            onClick={() =>
              props.linkToSearchPage({ worldName: data.worldName })
            }
          >
            {data.worldName}
          </MostVisitedWorldTd>
          <Td>{data.count}</Td>
        </Tr>
      );
    });

  return (
    <Wrapper>
      <DateSelectArea>
        <PreviousMonthButton onClick={() => onPreviousMonthButtonClick()} />
        <DateHeading onClick={() => showDatePicker()}>
          {props.date.getFullYear()}/{`0${props.date.getMonth() + 1}`.slice(-2)}
        </DateHeading>
        <DateHiddenInput
          type="month"
          ref={inputRef}
          onChange={(e) => onDateInputChange(e)}
        />
        <NextMonthButton onClick={() => onNextMonthButtonClick()} />
      </DateSelectArea>
      <StatisticWrapper>
        <NumberStatisticWrapper>
          <WorldVisitCountCard>
            <CardTitle>Worlds Visited</CardTitle>
            <WorldNumberWithIconWrapper>
              <Icon as={BsGlobe} boxSize={8} />
              <CardNumber>{props.joinCount ?? '-'}</CardNumber>
            </WorldNumberWithIconWrapper>
          </WorldVisitCountCard>
          <UserEncounteredCountCard>
            <CardTitle>Users Encountered</CardTitle>
            <UserNumberWithIconWrapper>
              <Icon as={BsFillPersonFill} boxSize={8} />
              <CardNumber>{props.encounterCount ?? '-'}</CardNumber>
            </UserNumberWithIconWrapper>
          </UserEncounteredCountCard>
        </NumberStatisticWrapper>
        <HeatmapWrapper>
          <HeadMapCard>
            <HeatmapCardTitle>Activity Heatmap</HeatmapCardTitle>
            <Chart
              options={heatmapOptions}
              series={heatmapData}
              type="heatmap"
              height="252"
            />
          </HeadMapCard>
        </HeatmapWrapper>
      </StatisticWrapper>
      <StatisticWrapper>
        <InstanceTypeCard>
          <CardTitle>Instance Type</CardTitle>
          <Chart
            options={dountChartOptions}
            series={instanceTypeData}
            type="donut"
            width="360"
          />
        </InstanceTypeCard>
        <MostVisitedWorldCard>
          <CardTitle>Most Visited World</CardTitle>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th width="10%" />
                  <Th width="70%">World Name</Th>
                  <Th width="20%">Visit</Th>
                </Tr>
              </Thead>
              <Tbody>{mostVisitedWorld}</Tbody>
            </Table>
          </TableContainer>
        </MostVisitedWorldCard>
      </StatisticWrapper>
    </Wrapper>
  );
};
export default Summary;
