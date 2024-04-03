import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import StatusBar from '../../component/common/StatusBar';
import { State } from '../../reducers';
import { AppDispatch } from '../../createStore';
import { getActivity } from '../../reducers/activityData';
import { getWorld } from '../../reducers/worldData';

const StatusBarContainer: React.FC = () => {
  const statusText = useSelector((state: State) => state.status.text);
  const isLoadingWorld = useSelector(
    (state: State) => state.worldData.isLoading
  );
  const isErrorWorld = useSelector((state: State) => state.worldData.isError);
  const loadingWorldError = useSelector(
    (state: State) => state.worldData.errorMessage
  );
  const isLoadingPhoto = useSelector(
    (state: State) => state.imageGallery.isLoading
  );
  const isErrorPhoto = useSelector(
    (state: State) => state.imageGallery.isError
  );
  const loadingPhotoError = useSelector(
    (state: State) => state.imageGallery.errorMessage
  );
  const dispatch = useDispatch<AppDispatch>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scanningToastRef = useRef<number | string>();

  const toast = useToast();

  const { t } = useTranslation();

  /**
   * 写真のスキャンをトリガーして結果に応じてトーストを出す
   */
  const scanPhoto = async () => {
    const response = await window.service.log.scanPhoto(false);
    if (response.status === 'success') {
      dispatch(getActivity());
      dispatch(getWorld());
      if (response.photoCount > response.oldPhotoCount) {
        toast({
          description: t('toast.scanFinishedWithNewPhoto.description').replace(
            '{NUMBER}',
            (response.photoCount - response.oldPhotoCount).toString()
          ),
          position: 'bottom-right',
          status: 'success',
          isClosable: false,
          containerStyle: {
            marginBottom: 4,
          },
        });
      } else {
        toast({
          description: t('toast.scanFinished.description'),
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
          title: t('toast.scanFinishedWithNoPhoto.heading'),
          description: t('toast.scanFinishedWithNoPhoto.description'),
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

  useEffect(() => {
    if (!isLoadingPhoto && !isLoadingWorld) {
      if (scanningToastRef.current) {
        toast.close(scanningToastRef.current);
      }
      if (isErrorPhoto || isErrorWorld) {
        toast({
          title: 'ERROR',
          description: loadingPhotoError ?? loadingWorldError,
          position: 'bottom-right',
          status: 'error',
          isClosable: false,
          containerStyle: {
            marginBottom: 4,
          },
        });
      }
    }
  }, [isLoadingPhoto, isLoadingWorld]);

  const reload = () => {
    const scan = async () => {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      scanningToastRef.current = toast({
        description: t('toast.scanning.description'),
        position: 'bottom-right',
        status: 'loading',
        isClosable: false,
        duration: null,
        containerStyle: {
          marginBottom: 4,
        },
      });
      await scanPhoto();
      setIsLoading(false);
    };
    scan();
  };

  return <StatusBar onClickReloadButton={reload} statusText={statusText} />;
};
export default StatusBarContainer;
