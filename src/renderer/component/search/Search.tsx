import styled, { css } from 'styled-components';
import React, { CSSProperties, KeyboardEvent, RefObject } from 'react';
import {
  ListOnItemsRenderedProps,
  VariableSizeList as List,
} from 'react-window';
import {
  BsCardImage,
  BsFillPersonFill,
  BsGlobe,
  BsSearch,
} from 'react-icons/bs';
import ScrollContainer from '../../container/common/ScrollContainer';
import EmptyPanel from '../main/EmptyPanel';

interface Props {
  show: boolean;
  isLoading: boolean;
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
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  searchMode: 'WORLD' | 'USER';
  setSearchMode: (mode: 'WORLD' | 'USER') => void;
  viewMode: 'WORLD' | 'PHOTO';
  setViewMode: (mode: 'WORLD' | 'PHOTO') => void;
  search: () => void;
  searchResult: {
    photoCount: number | null;
    instanceCount: number;
    dayCount: number;
  } | null;
  inputOnKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  suggestion?: string[];
  setKeywordFromSuggestion: (keyword: string) => void;
  onInputBlur: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  selectedIndex: number | null;
  setSelectedSuggestionIndex: (index: number | null) => void;
}

const Wrapper = styled.div<{ show: boolean }>`
  height: 100%;
  ${(props) =>
    !props.show
      ? css`
          display: none;
        `
      : ''}
`;

const SearchPanel = styled.div`
  height: 50px;
  border-bottom: #d5d5d5 solid 1px;
  padding: 8px;
`;

const SearchForm = styled.div`
  display: flex;
`;

const SearchResultText = styled.p`
  margin-top: 0;
  margin-left: 80px;
  color: #112f49;
`;

const ListAreaWrapper = styled.div`
  margin: 0 0 10px 10px;
  height: 100%;
  overflow-y: scroll;
  display: flex;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ListWrapper = styled.div`
  width: calc(100% - 20px);
`;

const CustomList = styled(List)`
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Input = styled.input`
  border: #2474e4 1px solid;
  margin-left: -2px;
  width: 100%;
  height: 27px;
  position: absolute;
  left: 0;
  top: 0;
  outline: none;
`;

const SuggestionArea = styled.div<{ show: boolean }>`
  width: calc(100% - 4px);
  position: absolute;
  top: 30px;
  background-color: white;
  border: #b6b6b6 1px solid;
  border-radius: 0 0 4px 4px;
  z-index: 99;
  ${(props) =>
    props.show
      ? css``
      : css`
          display: none; ;
        `}
`;

const ButtonArea = styled.div<{ selected: boolean }>`
  width: 40px;
  height: 32px;
  z-index: 1;
  ${(props) =>
    props.selected
      ? css`
          background-color: #2474e4;
        `
      : css`
          background-color: #c6d0e3;
        `}
`;

const WorldButton = styled(BsGlobe)`
  font-size: 20px;
  color: white;
  margin-top: 6px;
  margin-left: 8px;
`;

const PersonIcon = styled(BsFillPersonFill)`
  font-size: 20px;
  color: white;
  margin-top: 6px;
  margin-left: 8px;
`;

const SearchButton = styled.div<{ enable: boolean }>`
  border: none;
  width: 40px;
  height: 31px;
  margin-left: -2px;
  z-index: 99;
  ${(props) =>
    props.enable
      ? css`
          background-color: #2474e4;
        `
      : css`
          background-color: #c6d0e3;
        `}
`;

const SearchIcon = styled(BsSearch)`
  color: white;
  margin-top: 6px;
  margin-left: 8px;
`;

const SearchResultWrapper = styled.div`
  display: flex;
`;

const ViewModeButtonWrapper = styled.div`
  display: flex;
  margin-left: 4px;
  margin-right: 4px;
`;

const ViewModeButtonWorldArea = styled.div`
  width: 30px;
  height: 24px;
`;

const WorldModeIcon = styled(BsGlobe)<{ selected: boolean }>`
  font-size: 20px;
  margin-top: 5px;
  margin-left: 7px;
  ${(props) =>
    props.selected
      ? css`
          color: #252424;
        `
      : css`
          color: #d3d3d3;
        `}
`;

const DateModeIcon = styled(BsCardImage)<{ selected: boolean }>`
  font-size: 20px;
  margin-top: 5px;
  margin-left: 7px;
  ${(props) =>
    props.selected
      ? css`
          color: #252424;
        `
      : css`
          color: #d3d3d3;
        `}
`;

const InputArea = styled.div`
  width: 100%;
  position: relative;
`;

const SuggestionItem = styled.div<{ selected: boolean }>`
  width: 100%;

  ${(props) =>
    props.selected
      ? css`
          background-color: #d9d9d9;
        `
      : css``}
`;

const SuggestionItemText = styled.p`
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 4px;
`;

const Search: React.FC<Props> = (props) => {
  const photoCountText = props.searchResult?.photoCount
    ? `${props.searchResult.photoCount} photos,  `
    : '';

  return (
    <Wrapper show={props.show}>
      <SearchPanel>
        <SearchForm>
          <ButtonArea
            selected={props.searchMode === 'WORLD'}
            onClick={() => props.setSearchMode('WORLD')}
          >
            <WorldButton />
          </ButtonArea>
          <ButtonArea
            selected={props.searchMode === 'USER'}
            onClick={() => props.setSearchMode('USER')}
          >
            <PersonIcon />
          </ButtonArea>
          <InputArea onBlur={props.onInputBlur}>
            <Input
              type="text"
              value={props.searchKeyword}
              onChange={(e) => props.setSearchKeyword(e.target.value)}
              onKeyPress={(e) => props.inputOnKeyPress(e)}
              onKeyDown={(e) => props.onKeyDown(e)}
            />
            <SuggestionArea
              show={!!props.suggestion && props.suggestion.length !== 0}
            >
              {props.suggestion?.slice(0, 20).map((item, index) => (
                <SuggestionItem
                  selected={props.selectedIndex === index}
                  onClick={() => props.setKeywordFromSuggestion(item)}
                  onMouseEnter={() => props.setSelectedSuggestionIndex(index)}
                >
                  <SuggestionItemText>{item}</SuggestionItemText>
                </SuggestionItem>
              ))}
            </SuggestionArea>
          </InputArea>

          <SearchButton
            onClick={() => props.search()}
            enable={!props.isLoading}
          >
            <SearchIcon />
          </SearchButton>
          <ViewModeButtonWrapper>
            <ViewModeButtonWorldArea onClick={() => props.setViewMode('PHOTO')}>
              <DateModeIcon selected={props.viewMode === 'PHOTO'} />
            </ViewModeButtonWorldArea>
            <ViewModeButtonWorldArea onClick={() => props.setViewMode('WORLD')}>
              <WorldModeIcon selected={props.viewMode === 'WORLD'} />
            </ViewModeButtonWorldArea>
          </ViewModeButtonWrapper>
        </SearchForm>

        <SearchResultWrapper>
          {props.searchResult?.instanceCount !== 0 ? (
            <SearchResultText>
              {props.searchResult !== null && !props.isLoading
                ? `${photoCountText}${props.searchResult.instanceCount} instances,  ${props.searchResult.dayCount} days found`
                : ''}
            </SearchResultText>
          ) : (
            <SearchResultText />
          )}
        </SearchResultWrapper>
      </SearchPanel>

      <ListAreaWrapper>
        <ListWrapper ref={props.contentsRef}>
          {props.listRowCount === 0 ? (
            <EmptyPanel text="No Photo found" />
          ) : (
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
          )}
        </ListWrapper>

        <ScrollContainer
          height={props.listHeight ?? 1000}
          dataIndexList={props.dateIndexList}
          scrollToIndex={props.scrollToIndex}
          viewedItemIndex={props.viewedItemIndex}
        />
      </ListAreaWrapper>
    </Wrapper>
  );
};
export default Search;
