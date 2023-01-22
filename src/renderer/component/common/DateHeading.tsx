import styled from 'styled-components';
import React from 'react';
import moment from 'moment';

interface Props {
  date: Date;
}

const Wrapper = styled.div`
  height: 32px;
  display: flex;
  margin-bottom: 4px;
  border-bottom: #34548c 2px solid;
`;

const Heading = styled.h2`
  height: 30px;
  margin-top: 0;
  margin-bottom: 0;
  font-size: 24px;
  font-family: '游ゴシック', system-ui;
  font-weight: 500;
  color: #112f49;
`;

const DateHeading: React.FC<Props> = (props) => {
  const dateText = moment(props.date).format('YYYY/MM/DD ddd');
  return (
    <Wrapper>
      <Heading>{dateText}</Heading>
    </Wrapper>
  );
};
export default DateHeading;
