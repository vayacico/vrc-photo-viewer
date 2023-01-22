import styled from 'styled-components';
import { BsArrowLeft, BsDash, BsSquare, BsX } from 'react-icons/bs';
import React from 'react';

interface Props {
  onClickBackButton: (e: React.MouseEvent) => void;
  onClickMinimize: (e: React.MouseEvent) => void;
  onClickSizeChange: (e: React.MouseEvent) => void;
  onClickClose: (e: React.MouseEvent) => void;
}

const Wrapper = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 31px;
  position: fixed;
  background-color: #2c61b0;
  border-bottom: 1px #14347b solid;
  display: flex;
`;

const DraggableArea = styled.div`
  -webkit-app-region: drag;
  width: calc(100% - 96px - 60px);
  height: 100%;
`;

const BackButtonArea = styled.div`
  width: 60px;
  height: 100%;
  background-color: #2c61b0;

  &:hover {
    background-color: #5780d5;
    color: #95a1a9;
  }

  &:active {
    background-color: #2457b4;
  }
`;

const BackButton = styled(BsArrowLeft)`
  font-size: 1.6em;
  margin-left: 16px;
  margin-top: 4px;
  color: white;
  display: inline-block;
`;

const Title = styled.h1`
  font-size: 12px;
  margin-left: 8px;
  color: white;
`;

const ButtonArea = styled.div`
  width: 96px;
  height: 100%;
  display: flex;
`;

const MinimizeButtonArea = styled.div`
  height: 32px;
  width: 32px;
  color: #c8d5e1;
  background-color: transparent;

  &:hover {
    background-color: #5780d5;
    color: white;
  }

  &:active {
    background-color: #2457b4;
  }
`;

const MinimizeButton = styled(BsDash)`
  height: 32px;
  width: 20px;
  margin-left: 6px;
`;

const MaximizeButtonArea = styled.div`
  right: 32px;
  height: 32px;
  width: 32px;
  color: #c8d5e1;
  background-color: transparent;

  &:hover {
    background-color: #5f82d5;
    color: white;
  }

  &:active {
    background-color: #2457b4;
  }
`;

const MaximizeButton = styled(BsSquare)`
  height: 32px;
  width: 12px;
  margin-left: 10px;
`;

const CloseButtonArea = styled.div`
  height: 32px;
  width: 32px;
  color: #c8d5e1;
  background-color: transparent;

  &:hover {
    background-color: #c55350;
    color: white;
  }
`;

const CloseButton = styled(BsX)`
  height: 32px;
  width: 25px;
  margin-left: 2px;
`;

const TitleBar: React.FC<Props> = (props) => {
  return (
    <Wrapper>
      <BackButtonArea onClick={props.onClickBackButton}>
        <BackButton />
      </BackButtonArea>
      <DraggableArea>
        <Title />
      </DraggableArea>
      <ButtonArea>
        <MinimizeButtonArea onClick={props.onClickMinimize}>
          <MinimizeButton />
        </MinimizeButtonArea>
        <MaximizeButtonArea onClick={props.onClickSizeChange}>
          <MaximizeButton />
        </MaximizeButtonArea>
        <CloseButtonArea onClick={props.onClickClose}>
          <CloseButton />
        </CloseButtonArea>
      </ButtonArea>
    </Wrapper>
  );
};
export default TitleBar;
