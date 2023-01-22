import { useSelector } from 'react-redux';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import {
  ListOnItemsRenderedProps,
  VariableSizeList as List,
} from 'react-window';
import { Skeleton, SkeletonText } from '@chakra-ui/react';
import styled from 'styled-components';
import { State } from '../../reducers';
import WorldComponent from '../../component/world/WorldComponent';
import Thumbnail from '../../component/common/Thumbnail';
import RowWrapper from '../../component/common/RowWrapper';
import DateHeading from '../../component/common/DateHeading';
import { WorldData } from '../../../dto/ActivityLog';
import PlaceHolder from '../../component/common/PlaceHolder';
import EmptyPanel from '../../component/main/EmptyPanel';
import LazyWorldThumbnailContainer from '../common/LazyWorldThumbnailContainer';

const Wrapper = styled.div`
  width: 100%;
`;

const WorldGalleryContainer: React.FC = () => {
  const world = useSelector((state: State) => state.worldData.world);
  const photo = useSelector((state: State) => state.imageGallery.photo);
  const mode = useSelector((state: State) => state.pageMode.current.mode);
  const isErrorWorldLoad = useSelector(
    (state: State) => state.worldData.isError
  );
  const isErrorPhotoLoad = useSelector(
    (state: State) => state.imageGallery.isError
  );

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState<number>();
  const [rowHeightList, setRowHeightList] = useState<number[]>([]);
  const [rowList, setRowList] = useState<JSX.Element[]>([]);
  const [dateIndexList, setDateIndexList] = useState(
    [] as { date: Date; index: number }[]
  );
  const [scrollLabelAnchor, setScrollLabelAnchor] = useState(0);
  const [instanceIdSet, setInstanceIdSet] = useState(new Set());
  const [isResizing, setIsResizing] = useState(false);

  const contentsRef = useRef<HTMLDivElement>(null);
  const reactWindowRef = useRef<List>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);
  const rowIndexToItemIndexMap = useRef(new Map<number, string>());
  const beforeResizeViewItemIndex = useRef<null | string>(null);
  const scrollTargetIndex = useRef<null | number>(null);

  useEffect(() => {
    setInstanceIdSet(
      photo !== null
        ? new Set(
            photo.map(
              (item) => `${item.instanceId}-${item.joinDate.toISOString()}`
            )
          )
        : new Set()
    );
  }, [photo]);

  /**
   * ウインドウリサイズ時の処理
   */
  const handleResize = () => {
    const { current } = contentsRef;
    if (current) {
      if (current.getBoundingClientRect().width === 0) return;
      setWidth(current.getBoundingClientRect().width);
      setHeight(current.getBoundingClientRect().height);
    }
  };

  /**
   * レンダリング後初回処理
   */
  useEffect(() => {
    handleResize();
    // ウインドウリサイズイベントハンドラ登録
    window.addEventListener('resize', handleResize);
  }, []);

  /**
   * メニュー切り替え時処理
   */
  useEffect(() => {
    handleResize();
  }, [mode]);

  /**
   * ウインドウ横幅変更時の処理
   */
  useEffect(() => {
    // リサイズ開始時
    if (!isResizingRef.current) {
      setIsResizing(true);
      for (let i = scrollLabelAnchor; i < scrollLabelAnchor + 100; i += 1) {
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

  const generateItemId = (index: number, type: 'photo' | 'heading') => {
    return `${type}${index}`;
  };

  /**
   * データ取得完了時、ウインドウリサイズ時のリストレンダリング処理
   */
  useEffect(() => {
    if (width === 0) {
      return;
    }
    const photoNumPerRow = Math.floor(width / 600) + 1; // 600pxを最大幅として計算
    const imageWidth = width / photoNumPerRow - 4;
    const imageHeight = imageWidth * (1080 / 1920) + 4;

    let tmpRow: JSX.Element[] = [];
    const tmpScrollLabelAnchor = [] as { date: Date; index: number }[];
    const tmpListItem = [] as {
      row: JSX.Element;
      height: number;
    }[];
    const tmpRowIndexToItemIndexMap = new Map<number, string>();

    if (world === null) {
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
    } else {
      let lastWorld: WorldData | null = null;
      for (let i = 0; i < world.length; i += 1) {
        // 写真がない場合はスキップ
        if (
          !instanceIdSet.has(
            `${world[i].instanceId}-${world[i].joinDate.toISOString()}`
          )
        ) {
          continue;
        }

        // 前の要素と日時が異なるときは現在のRowを格納し日時表示を追加
        if (
          tmpListItem.length === 0 ||
          lastWorld?.joinDate.toLocaleDateString() !==
            world[i].joinDate.toLocaleDateString()
        ) {
          // 前インスタンスの写真がある場合は空要素を規定数だけ挿入
          if (tmpRow.length !== 0) {
            while (tmpRow.length < photoNumPerRow) {
              tmpRow.push(
                <Wrapper>
                  <Thumbnail isLoading={false} />
                </Wrapper>
              );
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
          } else {
            tmpListItem.push({
              row: <PlaceHolder height={10} />,
              height: 10,
            });
            tmpScrollLabelAnchor.push({
              date: world[i].joinDate,
              index: 0,
            });
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

    tmpListItem.push({
      row: <PlaceHolder height={4} />,
      height: 4,
    });

    setRowHeightList(tmpListItem.map((item) => item.height));
    setRowList(tmpListItem.map((item) => item.row));
    setDateIndexList(tmpScrollLabelAnchor);
    rowIndexToItemIndexMap.current = tmpRowIndexToItemIndexMap;
    const { current: list } = reactWindowRef;
    list?.resetAfterIndex(0);
  }, [world, photo, width, instanceIdSet, isResizing]);

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

  /**
   * React-Windowに渡す行レンダリング関数
   * @param arg
   */
  const getRowItem = (arg: { index: number; style: CSSProperties }) => {
    return <div style={arg.style}>{rowList[arg.index]}</div>;
  };

  /**
   * 指定されたインデックスへのスクロール
   * @param index React-Windowリストのインデックス
   */
  const scrollToIndex = (index: number) => {
    const { current: list } = reactWindowRef;
    if (list) {
      list.scrollToItem(index, 'start');
    }
  };

  /**
   * アイテムが表示された時のハンドラ
   * @param listOnItemsRenderedProps
   */
  const onItemsRendered = (
    listOnItemsRenderedProps: ListOnItemsRenderedProps
  ) => {
    if (listOnItemsRenderedProps.visibleStartIndex > 1) {
      setScrollLabelAnchor(
        Math.ceil(listOnItemsRenderedProps.visibleStartIndex)
      );
    }
  };

  if (photo !== null && photo.length === 0 && mode === 'WORLD') {
    return <EmptyPanel text="No world found" />;
  }
  if ((isErrorPhotoLoad || isErrorWorldLoad) && mode === 'WORLD') {
    return <EmptyPanel text="world load error" />;
  }

  return (
    <WorldComponent
      getRowHeight={(index: number) => rowHeightList[index]}
      getRowItem={getRowItem}
      contentsRef={contentsRef}
      listRowCount={rowList.length}
      show={mode === 'WORLD'}
      listRef={reactWindowRef}
      listHeight={height}
      dateIndexList={dateIndexList}
      scrollToIndex={scrollToIndex}
      onItemsRendered={onItemsRendered}
      viewedItemIndex={scrollLabelAnchor}
    />
  );
};
export default WorldGalleryContainer;
