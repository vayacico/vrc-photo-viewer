import { useDispatch, useSelector } from 'react-redux';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import {
  ListOnItemsRenderedProps,
  VariableSizeList as List,
} from 'react-window';
import { Skeleton, SkeletonText } from '@chakra-ui/react';
import styled from 'styled-components';
import PhotoGalley from '../../component/photo/PhotoGalley';
import { State } from '../../reducers';
import { imageGalleryActions } from '../../reducers/activityData';
import Thumbnail from '../../component/common/Thumbnail';
import RowWrapper from '../../component/common/RowWrapper';
import WorldNameHeading from '../../component/common/WorldNameHeading';
import { pageModeActions } from '../../reducers/pageMode';
import PlaceHolder from '../../component/common/PlaceHolder';
import EmptyPanel from '../../component/main/EmptyPanel';
import { statusActions } from '../../reducers/status';
import LazyThumbnailContainer from '../common/LazyThumbnailContainer';

const Wrapper = styled.div`
  width: 100%;
`;

const PhotoGalleryContainer: React.FC = () => {
  const photo = useSelector((state: State) => state.imageGallery.photo);
  const mode = useSelector((state: State) => state.pageMode.current.mode);
  const isLoading = useSelector((state: State) => state.imageGallery.isLoading);
  const isError = useSelector((state: State) => state.imageGallery.isError);
  const scrollInstanceId = useSelector(
    (state: State) => state.pageMode.current.scrollInstanceId
  );
  const dispatch = useDispatch();

  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [rowList, setRowList] = useState<JSX.Element[]>([]);
  const [rowHeightList, setRowHeightList] = useState<number[]>([]);
  const [instanceIdAnchor, setInstanceIdAnchor] = useState(
    new Map<string, number>()
  );
  const [scrollLabelAnchor, setScrollLabelAnchor] = useState(
    [] as { date: Date; index: number }[]
  );
  const [viewedItemIndex, setViewedItemIndex] = useState(0);
  const [isResizing, setIsResizing] = useState(false);

  const contentsRef = useRef<HTMLDivElement>(null);
  const reactWindowRef = useRef<List>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);
  const rowIndexToItemIndexMap = useRef(new Map<number, string>());
  const beforeResizeViewItemIndex = useRef<null | string>(null);
  const scrollTargetIndex = useRef<null | number>(null);

  /**
   * ???????????????????????????????????????
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
   * ?????????????????????????????????????????????
   * @param photoIndex ?????????????????????????????????????????????????????????
   */
  const onClickPhoto = (photoIndex: number) => {
    dispatch(
      imageGalleryActions.setSelected({
        selectedPhotoIndex: photoIndex,
      })
    );
    dispatch(
      pageModeActions.replace({
        mode: 'PHOTO_DETAIL_FOR_GALLERY',
      })
    );
  };

  const setStatus = (text: string) => {
    dispatch(statusActions.setStatus({ text }));
  };

  /**
   * ?????????????????????????????????
   */
  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  /**
   * ?????????????????????????????????
   */
  useEffect(() => {
    handleResize();
  }, [mode]);

  /**
   * ???????????????????????????????????????
   */
  useEffect(() => {
    // ?????????????????????
    if (!isResizingRef.current) {
      setIsResizing(true);
      for (let i = viewedItemIndex; i < viewedItemIndex + 10; i += 1) {
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
      // ?????????????????????
      isResizingRef.current = false;
      setIsResizing(false);
    }, 500);
  }, [width]);

  const generateItemId = (index: number, type: 'photo' | 'heading') => {
    return `${type}${index}`;
  };

  /**
   * ?????????????????????????????????????????????????????????????????????????????????????????????
   */
  useEffect(() => {
    if (!width) {
      return;
    }
    // 1????????????????????????????????????????????????
    const photoNumPerRow = Math.floor(width / 600) + 1; // 600px???????????????????????????
    const imageWidth = width / photoNumPerRow - 4;
    const imageHeight = imageWidth * (1080 / 1920) + 4;

    // state??????????????????????????????
    let tmpRow: JSX.Element[] = [];
    const tmpInstanceIdAnchor = new Map();
    const tmpScrollLabelAnchor = [] as { date: Date; index: number }[];
    const tmpListItem = [] as {
      row: JSX.Element;
      height: number;
    }[];
    const tmpRowIndexToItemIndexMap = new Map<number, string>();

    if (photo === null || isResizing) {
      const imageRow: JSX.Element[] = [];
      for (let i = 0; i < photoNumPerRow; i += 1) {
        imageRow.push(<Skeleton width="100%" height="100%" />);
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
        tmpListItem.push({
          row: <PlaceHolder height={10} />,
          height: 10,
        });
      }
    } else {
      for (let i = 0; i < photo.length; i += 1) {
        if (i === 0) {
          tmpListItem.push({
            row: <PlaceHolder height={2} />,
            height: 2,
          });
          tmpScrollLabelAnchor.push({
            date: photo[i].createdDate,
            index: 0,
          });
        }
        // ???????????????Join????????????????????????????????????Row????????????????????????????????????
        if (i === 0 || photo[i - 1].joinDate !== photo[i].joinDate) {
          // ?????????????????????????????????????????????????????????????????????????????????
          if (tmpRow.length !== 0) {
            while (tmpRow.length < photoNumPerRow) {
              tmpRow.push(
                <Wrapper>
                  <Thumbnail isLoading={false} />
                </Wrapper>
              );
            }
            // ????????????
            tmpListItem.push({
              row: <RowWrapper>{tmpRow}</RowWrapper>,
              height: imageHeight,
            });
            tmpScrollLabelAnchor.push({
              date: photo[i].createdDate,
              index: tmpListItem.length - 1,
            });
          }
          // ??????????????????????????????????????????
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
          tmpInstanceIdAnchor.set(
            `${photo[i].instanceId}-${photo[i].joinDate}`,
            tmpListItem.length - 1
          );
          tmpScrollLabelAnchor.push({
            date: photo[i].createdDate,
            index: tmpListItem.length - 1,
          });
          // ????????????????????????
          tmpRow = [];
        }
        // ???????????????photoNum????????????????????????????????????Row?????????
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
        // ?????????Row?????????
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
          // ????????????
          tmpListItem.push({
            row: <RowWrapper>{tmpRow}</RowWrapper>,
            height: imageHeight,
          });
          tmpScrollLabelAnchor.push({
            date: photo[i].createdDate,
            index: tmpListItem.length - 1,
          });
        }
      }
    }

    tmpListItem.push({
      row: <PlaceHolder height={4} />,
      height: 4,
    });

    setRowHeightList(tmpListItem.map((item) => item.height));
    setRowList(tmpListItem.map((item) => item.row));
    setInstanceIdAnchor(tmpInstanceIdAnchor);
    setScrollLabelAnchor(tmpScrollLabelAnchor);
    rowIndexToItemIndexMap.current = tmpRowIndexToItemIndexMap;
    const { current: list } = reactWindowRef;
    list?.resetAfterIndex(0, true);
  }, [isLoading, photo, width, isResizing]);

  /**
   * ??????????????????????????????????????????????????????????????????
   */
  useEffect(() => {
    const { current } = reactWindowRef;
    if (
      current &&
      scrollInstanceId &&
      instanceIdAnchor.get(scrollInstanceId) !== null
    ) {
      current.scrollToItem(
        instanceIdAnchor.get(scrollInstanceId) as number,
        'start'
      );
      setViewedItemIndex(instanceIdAnchor.get(scrollInstanceId) as number);
      dispatch(pageModeActions.clearInstanceId());
    } else if (current && scrollTargetIndex.current) {
      current.scrollToItem(scrollTargetIndex.current, 'start');
      scrollTargetIndex.current = null;
    }
  }, [rowList, instanceIdAnchor, scrollInstanceId]);

  /**
   * React-Window????????????????????????????????????
   * @param arg
   */
  const getRowItem = (arg: { index: number; style: CSSProperties }) => {
    return <div style={arg.style}>{rowList[arg.index]}</div>;
  };

  /**
   * ??????????????????????????????????????????????????????
   * @param index React-Window??????????????????????????????
   */
  const scrollToIndex = (index: number) => {
    const { current: list } = reactWindowRef;
    if (list) {
      list.scrollToItem(index);
    }
  };

  /**
   * ????????????????????????????????????????????????
   * @param listOnItemsRenderedProps
   */
  const onItemsRendered = (
    listOnItemsRenderedProps: ListOnItemsRenderedProps
  ) => {
    if (listOnItemsRenderedProps.visibleStartIndex > 1) {
      setViewedItemIndex(Math.ceil(listOnItemsRenderedProps.visibleStartIndex));
    }
  };

  if (photo !== null && photo.length === 0 && mode === 'GALLERY') {
    return <EmptyPanel text="No photo found" />;
  }
  if (isError && mode === 'GALLERY') {
    return <EmptyPanel text="photo load error" />;
  }

  return (
    <PhotoGalley
      getRowHeight={(index: number) => rowHeightList[index]}
      getRowItem={getRowItem}
      contentsRef={contentsRef}
      listRowCount={rowList.length}
      show={mode === 'GALLERY'}
      listRef={reactWindowRef}
      listHeight={height ?? 0}
      dateIndexList={scrollLabelAnchor}
      scrollToIndex={scrollToIndex}
      onItemsRendered={onItemsRendered}
      viewedItemIndex={viewedItemIndex}
    />
  );
};
export default PhotoGalleryContainer;
