import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import Contents from '../../component/main/Contents';
import { State } from '../../reducers';
import PhotoGalleryContainer from '../photo/PhotoGalleryContainer';
import PhotoDetailContainer from '../detail/PhotoDetailContainer';
import SettingContainer from '../setting/SettingContainer';
import WorldGalleryContainer from '../world/WorldGalleryContainer';
import SearchContainer from '../search/SearchContainer';
import { getActivity, imageGalleryActions } from '../../reducers/activityData';
import { getWorld, worldDataActions } from '../../reducers/worldData';
import { AppDispatch } from '../../createStore';
import { pageModeActions } from '../../reducers/pageMode';

const ContentContainer: React.FC = () => {
  const pageMode = useSelector((state: State) => state.pageMode.current);
  const isGetPhotoError = useSelector(
    (state: State) => state.imageGallery.isError
  );
  const getPhotoErrorMessage = useSelector(
    (state: State) => state.imageGallery.errorMessage
  );
  const isGetWorldError = useSelector(
    (state: State) => state.worldData.isError
  );
  const getWorldErrorMessage = useSelector(
    (state: State) => state.worldData.errorMessage
  );
  const dispatch = useDispatch<AppDispatch>();

  const scanningToastRef = useRef<number | string>();
  const errorToastRef = useRef<number | string>();
  const toast = useToast();

  // エラー状態が変化したらトーストを表示（写真取得）
  useEffect(() => {
    if (isGetPhotoError) {
      if (scanningToastRef.current) {
        toast.close(scanningToastRef.current);
      }
      if (!errorToastRef.current) {
        errorToastRef.current = toast({
          title: 'ERROR',
          description: getPhotoErrorMessage,
          position: 'bottom-right',
          status: 'error',
          isClosable: false,
          containerStyle: {
            marginBottom: 4,
          },
        });
      }
    }
  }, [isGetPhotoError, getPhotoErrorMessage]);

  // エラー状態が変化したらトーストを表示（ワールド取得）
  useEffect(() => {
    if (isGetWorldError) {
      if (scanningToastRef.current) {
        toast.close(scanningToastRef.current);
      }
      if (!errorToastRef.current) {
        errorToastRef.current = toast({
          title: 'ERROR',
          description: getWorldErrorMessage,
          position: 'bottom-right',
          status: 'error',
          isClosable: false,
          containerStyle: {
            marginBottom: 4,
          },
        });
      }
    }
  }, [isGetWorldError, getWorldErrorMessage]);

  /**
   * 写真のスキャンをトリガーして結果に応じてトーストを出す
   */
  const scanPhoto = async () => {
    const response = await window.service.log.scanPhoto(false);
    if (response.status === 'success') {
      dispatch(getActivity());
      dispatch(getWorld());
      await getWorld();
      if (scanningToastRef.current) {
        toast.close(scanningToastRef.current);
      }
      if (response.photoCount > response.oldPhotoCount) {
        toast({
          description: `${`new ${
            response.photoCount - response.oldPhotoCount
          }`} photos found.`,
          position: 'bottom-right',
          status: 'success',
          isClosable: false,
          containerStyle: {
            marginBottom: 4,
          },
        });
      } else {
        toast({
          description: `photo updated`,
          position: 'bottom-right',
          status: 'success',
          isClosable: false,
          containerStyle: {
            marginBottom: 4,
          },
        });
      }
      if (response.photoCount === 0) {
        toast({
          title: 'No photo found.',
          description: 'Check photo directory settings.',
          position: 'bottom-right',
          status: 'warning',
          isClosable: false,
          containerStyle: {
            marginBottom: 4,
          },
        });
      }
    } else {
      if (scanningToastRef.current) {
        toast.close(scanningToastRef.current);
      }
      toast({
        title: 'ERROR',
        description: response.message,
        position: 'bottom-right',
        status: 'error',
        isClosable: false,
        containerStyle: {
          marginBottom: 4,
        },
      });
    }
  };

  // 初回共通データの読み込み
  useEffect(() => {
    const init = async () => {
      const databaseFilePath =
        await window.service.settings.getDbFileLocation();
      if (!databaseFilePath) {
        toast({
          title: 'No configured',
          description: 'Set database file location in setting menu',
          position: 'bottom-right',
          status: 'info',
          isClosable: false,
          duration: 7000,
          containerStyle: {
            marginBottom: 4,
          },
        });
        dispatch(imageGalleryActions.clear());
        dispatch(worldDataActions.clear());
      } else {
        scanningToastRef.current = toast({
          description: 'Scanning images',
          position: 'bottom-right',
          status: 'loading',
          isClosable: false,
          duration: null,
          containerStyle: {
            marginBottom: 4,
          },
        });
        dispatch(getActivity());
        dispatch(getWorld());
        await scanPhoto();
      }
    };
    init();

    window.addEventListener('mouseup', (e) => {
      if (e.button === 3) {
        dispatch(pageModeActions.back());
      }
    });
  }, []);

  return (
    <Contents>
      {/* 再読み込みを防ぐために常に描画する */}
      <PhotoGalleryContainer />
      <WorldGalleryContainer />
      <SearchContainer />
      {pageMode.mode === 'PHOTO_DETAIL_FOR_GALLERY' ||
      pageMode.mode === 'PHOTO_DETAIL_FOR_SEARCH' ? (
        <PhotoDetailContainer />
      ) : null}
      {pageMode.mode === 'SETTING' ? <SettingContainer /> : null}
    </Contents>
  );
};
export default ContentContainer;
