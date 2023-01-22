import styled from 'styled-components';
import React from 'react';
import moment from 'moment';

const Container = styled.div`
  display: flex;
  height: 32px;
  border-bottom: #34548c 2px solid;
  margin-bottom: 4px;
`;

const WorldHeading = styled.h2`
  height: 30px;
  margin-top: 0;
  margin-bottom: 0;
  color: #112f49;
  font-size: 24px;
  font-family: '游ゴシック', system-ui;
  font-weight: 500;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const DateHeading = styled.h2`
  height: 30px;
  margin-top: 8px;
  margin-bottom: 0;
  margin-left: 16px;
  font-size: 16px;
  font-family: '游ゴシック', system-ui;
  font-weight: 500;
  color: #8797a6;
`;

interface Props {
  name: string;
  instanceId: string;
  date: Date;
  setStatus: (text: string) => void;
}

const WorldNameHeading: React.FC<Props> = (props) => {
  const ids = props.instanceId && props.instanceId.split(':');
  const url = `https://vrchat.com/home/world/${
    ids && ids.length !== 0 ? ids[0] : ''
  }`;

  const dateText = moment(props.date).format('YYYY/MM/DD ddd HH:mm:ss');

  return (
    <Container>
      <WorldHeading
        onClick={() => window.service.application.openUrlInBrowser(url)}
        onMouseEnter={() => props.setStatus(url)}
        onMouseLeave={() => props.setStatus('')}
      >{`${props.name}`}</WorldHeading>
      <DateHeading>{dateText}</DateHeading>
    </Container>
  );
};
export default WorldNameHeading;
