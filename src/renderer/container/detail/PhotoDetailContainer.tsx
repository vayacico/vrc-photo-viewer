import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';
import PhotoDetailWrapper from '../../component/detail/PhotoDetailWrapper';
import PhotoDetail from '../../component/detail/PhotoDetail';
import PhotoDetailPanel from '../../component/detail/PhotoDetailPanel';
import { State } from '../../reducers';
import { imageGalleryActions } from '../../reducers/activityData';
import { searchResultActions } from '../../reducers/searchResult';
import { statusActions } from '../../reducers/status';

const PhotoDetailContainer: React.FC = () => {
  const photoList = useSelector((state: State) => state.imageGallery.photo);
  const searchResult = useSelector((state: State) => state.searchResult.photo);
  const selectedListIndex =
    useSelector((state: State) => state.imageGallery.selectedPhotoIndex) ?? 0;
  const selectedSearchIndex =
    useSelector((state: State) => state.searchResult.selectedPhotoIndex) ?? 0;
  const mode = useSelector((state: State) => state.pageMode.current.mode);
  const dispatch = useDispatch();

  const [showDetail, setShowDetail] = useState(false);
  const [pressed, setPressed] = useState(false);

  const targetList =
    mode === 'PHOTO_DETAIL_FOR_GALLERY' ? photoList : searchResult;
  const targetIndex =
    mode === 'PHOTO_DETAIL_FOR_GALLERY'
      ? selectedListIndex
      : selectedSearchIndex;

  const { data } = useQuery<string[]>(
    targetList !== null
      ? `${targetList[targetIndex].instanceId}-${targetList[targetIndex].joinDate}-${targetList[targetIndex].createdDate}`
      : 'NO_DATA',
    () => {
      if (targetList !== null) {
        return window.service.log.getUsers(
          targetList[targetIndex].joinDate,
          targetList[targetIndex].createdDate
        );
      }
      return [];
    }
  );

  const users = data ?? [];

  const setStatus = (text: string) => {
    dispatch(statusActions.setStatus({ text }));
  };

  const onNextButtonClick = () => {
    if (mode === 'PHOTO_DETAIL_FOR_GALLERY') {
      dispatch(
        imageGalleryActions.setSelected({
          selectedPhotoIndex: targetIndex + 1,
        })
      );
    } else {
      dispatch(
        searchResultActions.setSelected({
          selectedPhotoIndex: targetIndex + 1,
        })
      );
    }
  };
  const onPrevButtonClick = () => {
    if (mode === 'PHOTO_DETAIL_FOR_GALLERY') {
      dispatch(
        imageGalleryActions.setSelected({
          selectedPhotoIndex: targetIndex - 1,
        })
      );
    } else {
      dispatch(
        searchResultActions.setSelected({
          selectedPhotoIndex: targetIndex - 1,
        })
      );
    }
  };

  const onDragStart = (event: React.DragEvent) => {
    if (targetList !== null && targetList[targetIndex].originalFilePath) {
      event.preventDefault();
      window.service.application.onDrag(
        targetList[targetIndex].originalFilePath
      );
    }
  };

  useEffect(() => {
    // キーボードイベント設定
    const onKeyDown = (e: KeyboardEvent) => {
      if (!pressed) {
        if (
          e.key === 'ArrowRight' &&
          targetList !== null &&
          targetIndex !== targetList.length - 1
        ) {
          if (mode === 'PHOTO_DETAIL_FOR_GALLERY') {
            dispatch(
              imageGalleryActions.setSelected({
                selectedPhotoIndex: targetIndex + 1,
              })
            );
          } else {
            dispatch(
              searchResultActions.setSelected({
                selectedPhotoIndex: targetIndex + 1,
              })
            );
          }
        } else if (e.key === 'ArrowLeft' && targetIndex !== 0) {
          if (mode === 'PHOTO_DETAIL_FOR_GALLERY') {
            dispatch(
              imageGalleryActions.setSelected({
                selectedPhotoIndex: targetIndex - 1,
              })
            );
          } else {
            dispatch(
              searchResultActions.setSelected({
                selectedPhotoIndex: targetIndex - 1,
              })
            );
          }
        }
        setPressed(true);
      }
    };
    const onKeyUp = () => {
      setPressed(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [pressed, targetIndex]);

  if (targetList === null) {
    return null;
  }

  return (
    <PhotoDetailWrapper
      show={
        mode === 'PHOTO_DETAIL_FOR_GALLERY' ||
        mode === 'PHOTO_DETAIL_FOR_SEARCH'
      }
    >
      <PhotoDetail
        originalFilePath={targetList[targetIndex].originalFilePath}
        setShowDetail={setShowDetail}
        showDetail={showDetail}
        onDrag={onDragStart}
        selectNextImage={
          targetIndex !== targetList.length - 1 ? onNextButtonClick : null
        }
        selectPrevImage={targetIndex !== 0 ? onPrevButtonClick : null}
      />
      {showDetail ? (
        <PhotoDetailPanel
          worldName={targetList[targetIndex].worldName}
          instanceId={targetList[targetIndex].instanceId}
          joinDate={targetList[targetIndex].joinDate}
          createdDate={targetList[targetIndex].createdDate}
          originalFilePath={targetList[targetIndex].originalFilePath}
          users={users}
          setStatus={setStatus}
        />
      ) : null}
    </PhotoDetailWrapper>
  );
};
export default PhotoDetailContainer;
