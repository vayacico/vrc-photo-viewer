import styled, { css } from 'styled-components';
import {
  BsArrowLeftShort,
  BsArrowRightShort,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
} from 'react-icons/bs';
import React from 'react';

interface Props {
  showDetail: boolean;
  originalFilePath: string;
  selectNextImage: (() => void) | null;
  selectPrevImage: (() => void) | null;
  onDrag?: (e: React.DragEvent) => void;
  setShowDetail: (showDetail: boolean) => void;
}

const ImageWrapper = styled.div<{ showDetail: boolean }>`
  height: 100%;
  background-color: #d7d5d5;
  position: relative;

  ${(props) =>
    props.showDetail
      ? css`
          width: calc(100% - 400px);
        `
      : css`
          width: calc(100%);
        `}
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  z-index: 0;
`;

const InfoButtonWrapper = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0);
  border-radius: 100%;
  position: absolute;
  top: 10px;
  right: 10px;

  &:hover {
    background: rgba(175, 172, 172, 0.5);
  }

  &:active {
    background: rgba(175, 172, 172, 0.7);
  }
`;

const ShowButton = styled(BsChevronDoubleLeft)`
  width: 30px;
  height: 30px;
  margin-top: 10px;
  margin-left: 10px;
  color: white;
`;

const CloseButton = styled(BsChevronDoubleRight)`
  width: 30px;
  height: 30px;
  margin-top: 10px;
  margin-left: 10px;
  color: white;
`;

const PrevButtonArea = styled.div`
  height: 100%;
  width: 20%;
  margin-top: 100px;
  margin-bottom: 100px;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0);
  color: transparent;

  &:hover {
    color: white;
  }
`;

const PrevButtonWrapper = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0);
  border-radius: 100%;
  position: absolute;
  top: calc((100% / 2) - 5px - 100px);
  left: 10px;

  &:hover {
    background: rgba(175, 172, 172, 0.5);
    color: white;
  }

  &:active {
    background: rgba(175, 172, 172, 0.7);
  }
`;

const PrevButton = styled(BsArrowLeftShort)`
  margin-top: 10px;
  margin-left: 10px;
  width: 30px;
  height: 30px;
`;

const NextButtonArea = styled.div`
  margin-top: 100px;
  margin-bottom: 100px;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 20%;
  background: rgba(255, 255, 255, 0);
  color: transparent;

  &:hover {
    color: white;
  }
`;

const NextButtonWrapper = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0);
  border-radius: 100%;
  position: absolute;
  top: calc((100% / 2) - 5px - 100px);
  right: 10px;

  &:hover {
    background: rgba(175, 172, 172, 0.5);
    color: white;
  }

  &:active {
    background: rgba(175, 172, 172, 0.7);
  }
`;

const NextButton = styled(BsArrowRightShort)`
  margin-top: 10px;
  margin-left: 10px;
  width: 30px;
  height: 30px;
`;

const PhotoDetail: React.FC<Props> = (props) => {
  return (
    <ImageWrapper showDetail={props.showDetail}>
      <Image src={props.originalFilePath} onDragStart={props.onDrag} />
      <InfoButtonWrapper onClick={() => props.setShowDetail(!props.showDetail)}>
        {props.showDetail ? <CloseButton /> : <ShowButton />}
      </InfoButtonWrapper>
      {props.selectPrevImage ? (
        <PrevButtonArea onClick={props.selectPrevImage}>
          <PrevButtonWrapper>
            <PrevButton />
          </PrevButtonWrapper>
        </PrevButtonArea>
      ) : null}
      {props.selectNextImage ? (
        <NextButtonArea onClick={props.selectNextImage}>
          <NextButtonWrapper>
            <NextButton />
          </NextButtonWrapper>
        </NextButtonArea>
      ) : null}
    </ImageWrapper>
  );
};
export default PhotoDetail;
