import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import StatusBar from '../../component/common/StatusBar';
import { State } from '../../reducers';
import { AppDispatch } from '../../createStore';
import { getActivity } from '../../reducers/activityData';
import { getWorld } from '../../reducers/worldData';
import { ErrorResponse } from '../../../dto/ActivityLog';
import { ScanResultResponse } from '../../../dto/ScanResult';

interface Props {
  isScanning: boolean;
  scanPhoto: (
    isRefresh: boolean
  ) => Promise<ScanResultResponse | ErrorResponse>;
}

const StatusBarContainer: React.FC<Props> = (props) => {
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
    if (props.isScanning) {
      return;
    }
    const response = await props.scanPhoto(false);
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
    } else if (response.status === 'isScanning') {
      if (scanningToastRef.current) {
        toast.close(scanningToastRef.current);
      }
    } else if (response.status === 'failed') {
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
    if (props.isScanning || isLoading) {
      return;
    }
    setIsLoading(true);
    if (scanningToastRef.current) {
      toast.close(scanningToastRef.current);
    }
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
    scanPhoto()
      // eslint-disable-next-line promise/always-return
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <StatusBar
      onClickReloadButton={reload}
      statusText={statusText}
      isScanning={props.isScanning}
    />
  );
};
export default StatusBarContainer;
