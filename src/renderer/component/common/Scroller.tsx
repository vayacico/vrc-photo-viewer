import styled from 'styled-components';
import React, { RefObject } from 'react';

interface Props {
  scrollbarRef: RefObject<HTMLDivElement>;
  scrollbarHeight: number;
  targetPosition: number;
  targetVisibly: boolean;
  currentPosition: number;
  labelText: string;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ScrollArea = styled.div<{ height: number }>`
  height: ${(props) => `${props.height}px`};
  width: 20px;
  margin-left: 0;
  position: relative;
`;

const TargetPoint = styled.div.attrs<{ position: number }>((props) => ({
  style: {
    top: `${props.position + 16}px`,
  },
}))<{ position: number }>`
  height: 10px;
  width: 10px;
  background-color: #4545bb;
  position: absolute;
  border-radius: 50%;
  left: calc(100% / 2 - 5px);
  z-index: 2;
`;

const CurrentPoint = styled.div.attrs<{ position: number }>((props) => ({
  style: {
    top: `${props.position + 16}px`,
  },
}))<{ position: number }>`
  height: 10px;
  width: 10px;
  background-color: #e4e7f6;
  position: absolute;
  border-radius: 50%;
  left: calc(100% / 2 - 5px);
  z-index: 1;
`;

const TopPoint = styled.div`
  width: 5px;
  height: 5px;
  top: 16px;
  background-color: white;
  border: solid 3px #e4e7f6;
  position: absolute;
  border-radius: 50%;
  left: calc(100% / 2 - 5px);
  z-index: 1;
`;

const EndPoint = styled.div`
  height: 5px;
  width: 5px;
  bottom: 8px;
  background-color: white;
  border: solid 3px #e4e7f6;
  position: absolute;
  border-radius: 50%;
  left: calc(100% / 2 - 5px);
  z-index: 1;
`;

const ScrollLine = styled.div`
  height: calc(100% - 16px - 16px);
  width: 2px;
  margin-top: 16px;
  background-color: #e4e7f6;
  position: absolute;
  left: calc(100% / 2);
`;

const LabelTextArea = styled.div.attrs<{ position: number }>((props) => ({
  style: {
    top: `${props.position + 16 - 6}px`,
  },
}))<{ position: number }>`
  background-color: blue;
  left: -110px;
  height: 20px;
  width: 94px;
  position: absolute;
`;

const Arrow = styled.div.attrs<{ position: number }>((props) => ({
  style: {
    top: `${props.position + 16 - 6}px`,
  },
}))<{ position: number }>`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 0 10px 20px;
  border-color: transparent transparent transparent blue;
  position: absolute;
  left: -16px;
  z-index: 100;
`;

const LabelText = styled.p.attrs<{ position: number }>((props) => ({
  style: {
    top: `${props.position + 16 - 20}px`,
  },
}))<{ position: number }>`
  font-size: 14px;
  color: #ffffff;
  position: absolute;
  font-weight: bold;
  left: -100px;
  z-index: 100;
`;

const Scroller: React.FC<Props> = (props) => {
  return (
    <ScrollArea
      ref={props.scrollbarRef}
      height={props.scrollbarHeight}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
      onMouseDown={props.onMouseDown}
      onMouseLeave={props.onMouseLeave}
      onMouseEnter={props.onMouseEnter}
    >
      <ScrollLine />
      <TopPoint />
      <EndPoint />
      <CurrentPoint position={props.currentPosition} />
      {props.targetVisibly ? (
        <>
          <TargetPoint position={props.targetPosition} />
          <Arrow position={props.targetPosition} />
          <LabelTextArea position={props.targetPosition} />
          <LabelText position={props.targetPosition}>
            {props.labelText}
          </LabelText>
        </>
      ) : null}
    </ScrollArea>
  );
};
export default Scroller;
