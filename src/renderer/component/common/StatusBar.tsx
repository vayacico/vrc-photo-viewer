import styled from 'styled-components';
import { BsArrowClockwise } from 'react-icons/bs';
import React from 'react';

interface Props {
  statusText?: string;
  onClickReloadButton: (e: React.MouseEvent) => void;
}

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  height: 24px;
  width: 100%;
  background-color: #14367b;
  display: flex;
`;

const Text = styled.p`
  margin-top: 4px;
  margin-left: 8px;
  font-size: 12px;
  color: white;
`;

const ReloadIconButton = styled.div`
  width: 24px;
  height: 100%;
  margin-left: auto;

  &:hover {
    background-color: #395db2;
  }

  &:active {
    background-color: #0d2150;
  }
`;

const ReloadIcon = styled(BsArrowClockwise)`
  margin-top: 4px;
  margin-left: 4px;
  color: white;
`;

const StatusBar: React.FC<Props> = (props) => {
  return (
    <Wrapper>
      <Text>{props.statusText}</Text>
      <ReloadIconButton onClick={props.onClickReloadButton}>
        <ReloadIcon />
      </ReloadIconButton>
    </Wrapper>
  );
};
export default StatusBar;
