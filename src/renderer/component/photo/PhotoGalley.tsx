import styled, { css } from 'styled-components';
import React, { CSSProperties, RefObject } from 'react';
import {
  ListOnItemsRenderedProps,
  VariableSizeList as List,
} from 'react-window';
import ScrollContainer from '../../container/common/ScrollContainer';

interface Props {
  show: boolean;
  contentsRef: RefObject<HTMLDivElement>;
  listRef: RefObject<List<any>>;
  listRowCount: number;
  listHeight?: number;
  getRowHeight: (index: number) => number;
  getRowItem: (argument: {
    index: number;
    style: CSSProperties;
  }) => React.ReactElement;
  dateIndexList: { date: Date; index: number }[];
  scrollToIndex: (index: number) => void;
  onItemsRendered: (props: ListOnItemsRenderedProps) => void;
  viewedItemIndex: number;
}

const Wrapper = styled.div<{ show: boolean }>`
  margin: 0 0 10px 10px;
  height: 100%;
  overflow-y: scroll;
  display: flex;

  &::-webkit-scrollbar {
    display: none;
  }

  ${(props) =>
    !props.show
      ? css`
          display: none;
        `
      : ''}
`;

const ListWrapper = styled.div`
  width: calc(100% - 20px);
`;

const CustomList = styled(List)`
  &::-webkit-scrollbar {
    display: none;
  }
`;

const PhotoGalley: React.FC<Props> = (props) => {
  return (
    <Wrapper show={props.show}>
      <ListWrapper ref={props.contentsRef}>
        <CustomList
          height={props.listHeight ?? 1000}
          itemCount={props.listRowCount}
          itemSize={props.getRowHeight}
          width="100%"
          ref={props.listRef}
          onItemsRendered={props.onItemsRendered}
          overscanCount={10}
        >
          {props.getRowItem}
        </CustomList>
      </ListWrapper>

      <ScrollContainer
        height={props.listHeight ?? 1000}
        dataIndexList={props.dateIndexList}
        scrollToIndex={props.scrollToIndex}
        viewedItemIndex={props.viewedItemIndex}
      />
    </Wrapper>
  );
};
export default PhotoGalley;
