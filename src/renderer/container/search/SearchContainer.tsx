import { useDispatch, useSelector } from 'react-redux';
import React, {
  CSSProperties,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ListOnItemsRenderedProps,
  VariableSizeList as List,
} from 'react-window';
import { Skeleton, SkeletonText, useToast } from '@chakra-ui/react';
import styled from 'styled-components';
import { State } from '../../reducers';
import Thumbnail from '../../component/common/Thumbnail';
import RowWrapper from '../../component/common/RowWrapper';
import WorldNameHeading from '../../component/common/WorldNameHeading';
import { pageModeActions } from '../../reducers/pageMode';
import PlaceHolder from '../../component/common/PlaceHolder';
import Search from '../../component/search/Search';
import {
  searchPhotoByUserName,
  searchPhotoByWorldName,
  searchResultActions,
  searchWorldByUserName,
  searchWorldByWorldName,
} from '../../reducers/searchResult';
import { WorldData } from '../../../dto/ActivityLog';
import DateHeading from '../../component/common/DateHeading';
import { statusActions } from '../../reducers/status';
import LazyThumbnailContainer from '../common/LazyThumbnailContainer';
import LazyWorldThumbnailContainer from '../common/LazyWorldThumbnailContainer';
import { AppDispatch } from '../../createStore';

const Wrapper = styled.div`
  width: 100%;
`;

const SearchContainer: React.FC = () => {
  const type = useSelector((state: State) => state.searchResult.type);
  const defaultSearchKeyword = useSelector(
    (state: State) => state.pageMode.current.searchWord
  );
  const isLoading = useSelector((state: State) => state.searchResult.isLoading);
  const photo = useSelector((state: State) => state.searchResult.photo);
  const world = useSelector((state: State) => state.searchResult.world);
  const mode = useSelector((state: State) => state.pageMode.current.mode);
  const isError = useSelector((state: State) => state.searchResult.isError);
  const errorMessage = useSelector(
    (state: State) => state.searchResult.errorMessage
  );
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState<number>();
  const [rowList, setRowList] = useState<JSX.Element[]>([]);
  const [rowHeightList, setRowHeightList] = useState<number[]>([]);
  const [scrollLabelAnchor, setScrollLabelAnchor] = useState(
    [] as { date: Date; index: number }[]
  );
  const [viewedItemIndex, setViewedItemIndex] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchMode, setSearchMode] = useState<'WORLD' | 'USER'>('WORLD');
  const [viewMode, setViewMode] = useState<'WORLD' | 'PHOTO'>('PHOTO');
  const [instanceCountSet, setInstanceCountSet] = useState<Set<string>>(
    new Set()
  );
  const [dayCountSet, setDayCountSet] = useState<Set<string>>(new Set());
  const [suggestionList, setSuggestionList] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<
    number | null
  >(null);
  const [isResizing, setIsResizing] = useState(false);

  const contentsRef = useRef<HTMLDivElement>(null);
  const reactWindowRef = useRef<List>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);
  const rowIndexToItemIndexMap = useRef(new Map<number, string>());
  const beforeResizeViewItemIndex = useRef<null | string>(null);
  const scrollTargetIndex = useRef<null | number>(null);

  const handleResize = () => {
    const { current } = contentsRef;
    if (current) {
      if (current.getBoundingClientRect().width === 0) return;
      setWidth(current.getBoundingClientRect().width);
      setHeight(current.getBoundingClientRect().height - 50 - 8 - 8); // 検索バー分を引く
    }
  };

  const setStatus = (text: string) => {
    dispatch(statusActions.setStatus({ text }));
  };

  const search = async (keyword: string) => {
    if (isLoading) {
      return;
    }
    dispatch(searchResultActions.reset());
    setViewedItemIndex(0);

    const { current } = contentsRef;
    if (current) {
      const { current: list } = reactWindowRef;
      list?.scrollTo(0);
    }

    if (viewMode === 'PHOTO') {
      if (searchMode === 'WORLD') {
        dispatch(searchPhotoByWorldName(keyword));
      } else if (searchMode === 'USER') {
        dispatch(searchPhotoByUserName(keyword));
      }
    } else if (viewMode === 'WORLD') {
      if (searchMode === 'WORLD') {
        dispatch(searchWorldByWorldName(keyword));
      } else if (searchMode === 'USER') {
        dispatch(searchWorldByUserName(keyword));
      }
    }
  };

  const onClickPhoto = (photoIndex: number) => {
    dispatch(
      searchResultActions.setSelected({
        selectedPhotoIndex: photoIndex,
      })
    );
    dispatch(
      pageModeActions.replace({
        mode: 'PHOTO_DETAIL_FOR_SEARCH',
      })
    );
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    handleResize();
  }, [mode]);

  // 他モードからクエリが指定されていたら表示時に検索する
  useEffect(() => {
    if (defaultSearchKeyword) {
      setViewMode('PHOTO');
      setSearchKeyword(defaultSearchKeyword);
      search(defaultSearchKeyword);
      dispatch(pageModeActions.clearSearchKeyword());
    }
  }, [defaultSearchKeyword]);

  /**
   * ウインドウ横幅変更時の処理
   */
  useEffect(() => {
    // リサイズ開始時
    if (!isResizingRef.current) {
      setIsResizing(true);
      for (let i = viewedItemIndex; i < viewedItemIndex + 100; i += 1) {
        const index = rowIndexToItemIndexMap.current.get(i);
        if (index) {
          beforeResizeViewItemIndex.current = index;
          break;
        }
      }
    }
    isResizingRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      // リサイズ終了時
      isResizingRef.current = false;
      setIsResizing(false);
    }, 500);
  }, [width]);

  // 検索結果更新後のカウント
  useEffect(() => {
    if (type === 'photo') {
      setInstanceCountSet(new Set(photo.map((item) => item.instanceId)));
      setDayCountSet(
        new Set(photo.map((item) => item.joinDate.toDateString()))
      );
    } else if (type === 'world') {
      setInstanceCountSet(new Set(world.map((item) => item.instanceId)));
      setDayCountSet(
        new Set(world.map((item) => item.joinDate.toDateString()))
      );
    }
  }, [type, photo, world]);

  // エラー情報更新時のトースト表示処理
  useEffect(() => {
    if (isError) {
      toast({
        title: 'ERROR',
        description: errorMessage,
        position: 'bottom-right',
        status: 'error',
        isClosable: false,
        containerStyle: {
          marginBottom: 4,
        },
      });
    }
  }, [isError, errorMessage]);

  const generateItemId = (index: number, itemType: 'photo' | 'heading') => {
    return `${itemType}${index}`;
  };

  // リスト生成処理
  useEffect(() => {
    if (!width) {
      return;
    }
    const photoNumPerRow = Math.floor(width / 600) + 1; // 600pxを最大幅として計算
    const imageWidth = width / photoNumPerRow - 4;
    const imageHeight = imageWidth * (1080 / 1920) + 4;

    let tmpRow: JSX.Element[] = [];
    const tmpInstanceIdAnchor = new Map();
    const tmpScrollLabelAnchor = [] as { date: Date; index: number }[];
    const tmpListItem = [] as {
      row: JSX.Element;
      height: number;
    }[];
    const tmpRowIndexToItemIndexMap = new Map<number, string>();

    if (isLoading || isResizing) {
      const imageRow: JSX.Element[] = [];
      for (let i = 0; i < photoNumPerRow; i += 1) {
        imageRow.push(<Skeleton width={imageWidth} height={imageHeight - 8} />);
      }
      tmpListItem.push({
        row: <PlaceHolder height={10} />,
        height: 10,
      });
      for (let i = 0; i < 3; i += 1) {
        tmpListItem.push({
          row: <SkeletonText noOfLines={1} skeletonHeight="32px" width="60%" />,
          height: 40,
        });
        tmpListItem.push({
          row: <RowWrapper>{imageRow}</RowWrapper>,
          height: imageHeight,
        });
        tmpListItem.push({
          row: <RowWrapper>{imageRow}</RowWrapper>,
          height: imageHeight,
        });
      }
    } else if (viewMode === 'PHOTO') {
      for (let i = 0; i < photo.length; i += 1) {
        // 前の要素とJoin日時が異なるときは現在のRowを格納しワールド名を追加
        if (i === 0 || photo[i - 1].joinDate !== photo[i].joinDate) {
          // 前インスタンスの写真がある場合は空要素を規定数だけ挿入
          if (tmpRow.length !== 0) {
            while (tmpRow.length < photoNumPerRow) {
              tmpRow.push(
                <Wrapper>
                  <Thumbnail isLoading={false} />
                </Wrapper>
              );
            }
            // 行を追加
            tmpListItem.push({
              row: <RowWrapper>{tmpRow}</RowWrapper>,
              height: imageHeight,
            });
            tmpScrollLabelAnchor.push({
              date: photo[i].createdDate,
              index: tmpListItem.length - 1,
            });
          }
          // 余白とワールド名見出しを追加
          if (i !== 0) {
            tmpListItem.push({
              row: <PlaceHolder height={20} />,
              height: 20,
            });
            tmpScrollLabelAnchor.push({
              date: photo[i].createdDate,
              index: tmpListItem.length - 1,
            });
            tmpRowIndexToItemIndexMap.set(
              tmpListItem.length - 1,
              generateItemId(i, 'heading')
            );
          }
          tmpListItem.push({
            row: (
              <WorldNameHeading
                name={photo[i].worldName}
                date={photo[i].joinDate}
                instanceId={photo[i].instanceId}
                setStatus={setStatus}
              />
            ),
            height: 40,
          });
          tmpRowIndexToItemIndexMap.set(
            tmpListItem.length - 1,
            generateItemId(i, 'heading')
          );

          if (
            beforeResizeViewItemIndex.current === generateItemId(i, 'heading')
          ) {
            scrollTargetIndex.current = tmpListItem.length - 1;
          }
          tmpInstanceIdAnchor.set(photo[i].instanceId, tmpListItem.length - 1);
          tmpScrollLabelAnchor.push({
            date: photo[i].createdDate,
            index: tmpListItem.length - 1,
          });
          // 行の要素を初期化
          tmpRow = [];
        }
        // 写真の数がphotoNumに達していたときは現在のRowを格納
        if (tmpRow.length >= photoNumPerRow) {
          tmpListItem.push({
            row: <RowWrapper>{tmpRow}</RowWrapper>,
            height: imageHeight,
          });

          tmpScrollLabelAnchor.push({
            date: photo[i].createdDate,
            index: tmpListItem.length - 1,
          });
          tmpRow = [];
        }
        // 写真をRowに格納
        tmpRow.push(
          <LazyThumbnailContainer
            originalFilePath={photo[i].originalFilePath}
            onClick={() => onClickPhoto(i)}
          />
        );
        if (!tmpRowIndexToItemIndexMap.has(tmpListItem.length)) {
          tmpRowIndexToItemIndexMap.set(
            tmpListItem.length,
            generateItemId(i, 'photo')
          );
        }
        if (beforeResizeViewItemIndex.current === generateItemId(i, 'photo')) {
          scrollTargetIndex.current = tmpListItem.length;
        }

        if (i === photo.length - 1) {
          while (tmpRow.length < photoNumPerRow) {
            tmpRow.push(<Thumbnail isLoading={false} />);
          }
          // 行を追加
          tmpListItem.push({
            row: <RowWrapper>{tmpRow}</RowWrapper>,
            height: imageHeight,
          });
          tmpScrollLabelAnchor.push({
            date: photo[i].createdDate,
            index: tmpListItem.length - 1,
          });
          tmpListItem.push({
            row: <PlaceHolder height={20} />,
            height: 20,
          });
          tmpScrollLabelAnchor.push({
            date: photo[i].createdDate,
            index: tmpListItem.length - 1,
          });
        }
      }
    } else if (viewMode === 'WORLD') {
      let lastWorld: WorldData | null = null;
      for (let i = 0; i < world.length; i += 1) {
        // 前の要素と日時が異なるときは現在のRowを格納し日時表示を追加
        if (
          tmpListItem.length === 0 ||
          lastWorld?.joinDate.toLocaleDateString() !==
            world[i].joinDate.toLocaleDateString()
        ) {
          // 前インスタンスの写真がある場合は空要素を規定数だけ挿入
          if (tmpRow.length !== 0) {
            while (tmpRow.length < photoNumPerRow) {
              tmpRow.push(<Thumbnail isLoading={false} />);
            }
            tmpListItem.push({
              row: <RowWrapper>{tmpRow}</RowWrapper>,
              height: imageHeight,
            });
            tmpScrollLabelAnchor.push({
              date: world[i].joinDate,
              index: tmpListItem.length - 1,
            });
          }
          // 余白と日付見出しを追加
          if (i !== 0) {
            tmpListItem.push({
              row: <PlaceHolder height={20} />,
              height: 20,
            });
            tmpScrollLabelAnchor.push({
              date: world[i].joinDate,
              index: tmpListItem.length - 1,
            });
            tmpRowIndexToItemIndexMap.set(
              tmpListItem.length - 1,
              generateItemId(i, 'heading')
            );
          }
          tmpListItem.push({
            row: <DateHeading date={world[i].joinDate} />,
            height: 40,
          });
          tmpRowIndexToItemIndexMap.set(
            tmpListItem.length - 1,
            generateItemId(i, 'heading')
          );

          if (
            beforeResizeViewItemIndex.current === generateItemId(i, 'heading')
          ) {
            scrollTargetIndex.current = tmpListItem.length - 1;
          }
          tmpScrollLabelAnchor.push({
            date: world[i].joinDate,
            index: tmpListItem.length - 1,
          });
          tmpRow = [];
        }
        // 写真の数がphotoNumに達していたときは現在のRowを格納
        if (tmpRow.length >= photoNumPerRow) {
          tmpListItem.push({
            row: <RowWrapper>{tmpRow}</RowWrapper>,
            height: imageHeight,
          });
          tmpScrollLabelAnchor.push({
            date: world[i].joinDate,
            index: tmpListItem.length - 1,
          });
          tmpRow = [];
        }
        // 写真をRowに格納
        tmpRow.push(
          <LazyWorldThumbnailContainer
            worldName={world[i].worldName}
            instanceId={world[i].instanceId}
            joinDate={world[i].joinDate}
            estimateLeftDate={world[i].estimateLeftDate}
          />
        );
        lastWorld = world[i];
        if (!tmpRowIndexToItemIndexMap.has(tmpListItem.length)) {
          tmpRowIndexToItemIndexMap.set(
            tmpListItem.length,
            generateItemId(i, 'photo')
          );
        }
        if (beforeResizeViewItemIndex.current === generateItemId(i, 'photo')) {
          scrollTargetIndex.current = tmpListItem.length;
        }
      }
      if (lastWorld !== null) {
        while (tmpRow.length < photoNumPerRow) {
          tmpRow.push(<Thumbnail isLoading={false} />);
        }
        tmpListItem.push({
          row: <RowWrapper>{tmpRow}</RowWrapper>,
          height: imageHeight,
        });
        tmpScrollLabelAnchor.push({
          date: lastWorld.joinDate,
          index: tmpListItem.length - 1,
        });
      }
    }

    if (tmpListItem.length !== 0) {
      tmpListItem.push({
        row: <PlaceHolder height={4} />,
        height: 4,
      });
    }

    setRowHeightList(tmpListItem.map((item) => item.height));
    setRowList(tmpListItem.map((item) => item.row));
    setScrollLabelAnchor(tmpScrollLabelAnchor);
    rowIndexToItemIndexMap.current = tmpRowIndexToItemIndexMap;
    const { current: list } = reactWindowRef;
    list?.resetAfterIndex(0);
  }, [photo, world, width, isLoading, isResizing]);

  /**
   * リスト変更後にスクロールが必要ならスクロール
   */
  useEffect(() => {
    const { current } = reactWindowRef;
    if (current && scrollTargetIndex.current) {
      current.scrollToItem(scrollTargetIndex.current, 'start');
      scrollTargetIndex.current = null;
    }
  }, [rowList]);

  const getRowItem = (arg: { index: number; style: CSSProperties }) => {
    return <div style={arg.style}>{rowList[arg.index]}</div>;
  };

  const scrollToIndex = (index: number) => {
    const { current: list } = reactWindowRef;
    if (list) {
      list.scrollToItem(index);
    }
  };

  useEffect(() => {
    setSelectedSuggestionIndex(null);
  }, [suggestionList]);

  const onItemsRendered = (
    listOnItemsRenderedProps: ListOnItemsRenderedProps
  ) => {
    if (listOnItemsRenderedProps.visibleStartIndex > 1) {
      setViewedItemIndex(Math.ceil(listOnItemsRenderedProps.visibleStopIndex));
    }
  };

  const onInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex !== null) {
        setSearchKeyword(suggestionList[selectedSuggestionIndex]);
        search(suggestionList[selectedSuggestionIndex]);
      } else {
        search(searchKeyword);
      }
      setSuggestionList([]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
    }
  };

  const handleOnChange = (keyword: string) => {
    setSearchKeyword(keyword);

    if (keyword.length === 0) {
      setSuggestionList([]);
    } else if (searchMode === 'WORLD') {
      window.service.search
        .getWorldSuggestion(keyword)
        .then((result) => {
          setSuggestionList(result);
          return null;
        })
        .catch(() => {});
    } else if (searchMode === 'USER') {
      window.service.search
        .getUserSuggestion(keyword)
        .then((result) => {
          setSuggestionList(result);
          return null;
        })
        .catch(() => {});
    }
  };

  const setKeywordFromSuggestion = (keyword: string) => {
    setSearchKeyword(() => {
      search(keyword);
      return keyword;
    });
    setSuggestionList([]);
  };

  const onInputBlur = () => {
    setTimeout(() => {
      setSuggestionList([]);
    }, 200);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
      selectedSuggestionIndex === null
    ) {
      setSelectedSuggestionIndex(0);
    } else if (selectedSuggestionIndex !== null && e.key === 'ArrowUp') {
      setSelectedSuggestionIndex(
        selectedSuggestionIndex !== 0 ? selectedSuggestionIndex - 1 : 0
      );
    } else if (selectedSuggestionIndex !== null && e.key === 'ArrowDown') {
      setSelectedSuggestionIndex(
        Math.min(suggestionList.length, 20) - 1 > selectedSuggestionIndex
          ? selectedSuggestionIndex + 1
          : Math.min(suggestionList.length, 20) - 1
      );
    }
  };

  return (
    <Search
      getRowHeight={(index: number) => rowHeightList[index]}
      isLoading={isLoading}
      getRowItem={getRowItem}
      contentsRef={contentsRef}
      listRowCount={rowList.length}
      show={mode === 'SEARCH'}
      listRef={reactWindowRef}
      listHeight={height}
      dateIndexList={scrollLabelAnchor}
      scrollToIndex={scrollToIndex}
      onItemsRendered={onItemsRendered}
      viewedItemIndex={viewedItemIndex}
      searchKeyword={searchKeyword}
      setSearchKeyword={handleOnChange}
      searchMode={searchMode}
      setSearchMode={setSearchMode}
      search={() => search(searchKeyword)}
      searchResult={
        photo !== null
          ? {
              photoCount: photo.length,
              instanceCount: instanceCountSet.size,
              dayCount: dayCountSet.size,
            }
          : null
      }
      inputOnKeyPress={onInputKeyPress}
      viewMode={viewMode}
      setViewMode={setViewMode}
      suggestion={suggestionList}
      setKeywordFromSuggestion={setKeywordFromSuggestion}
      onInputBlur={onInputBlur}
      onKeyDown={onKeyDown}
      selectedIndex={selectedSuggestionIndex}
      setSelectedSuggestionIndex={setSelectedSuggestionIndex}
    />
  );
};
export default SearchContainer;
