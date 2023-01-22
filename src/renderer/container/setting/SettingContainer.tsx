import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Setting from '../../component/setting/Setting';
import { State } from '../../reducers';
import { getActivity } from '../../reducers/activityData';
import { getWorld } from '../../reducers/worldData';
import { AppDispatch } from '../../createStore';

const SettingContainer: React.FC = () => {
  const mode = useSelector((state: State) => state.pageMode.current.mode);
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

  const [databaseFilePath, setDatabaseFilePath] = useState('None');
  const [photoDirectoryPaths, setPhotoDirectoryPaths] = useState(
    [] as string[]
  );
  const [version, setVersion] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [applyStatus, setApplyStatus] = useState<
    'NOT_YET' | 'LOADING' | 'SUCCESS' | 'ERROR'
  >('NOT_YET');
  const dispatch = useDispatch<AppDispatch>();

  const getDatabaseFilePath = async () => {
    const dbFilePath = await window.service.settings.getDbFileLocation();
    setDatabaseFilePath(dbFilePath);
  };
  const getPhotoDirectoryPaths = async () => {
    const paths = await window.service.settings.getPhotoDirectoryLocations();
    setPhotoDirectoryPaths(paths);
  };
  const getVersionText = async () => {
    const result = await window.service.application.getVersion();
    setVersion(result);
  };

  // 表示時に各パスを取得
  useEffect(() => {
    getDatabaseFilePath();
    getPhotoDirectoryPaths();
    getVersionText();
  }, []);

  useEffect(() => {
    if (applyStatus === 'LOADING' && !isLoadingWorld && !isLoadingPhoto) {
      setApplyStatus('SUCCESS');
    } else if (isErrorWorld) {
      setApplyStatus('ERROR');
      setErrorMessage(loadingWorldError);
    } else if (isErrorPhoto) {
      setApplyStatus('ERROR');
      setErrorMessage(loadingPhotoError);
    }
  }, [isLoadingWorld, isLoadingPhoto, isErrorPhoto, isErrorWorld]);

  const showUpdateDatabaseFilePathDialog = async () => {
    // ファイル選択機能の呼び出し
    const path = await window.service.settings.selectDbFileLocation();
    if (path) {
      setDatabaseFilePath(path);
    }
  };

  const showAddPhotoDirectoryDialog = async () => {
    // ディレクトリ追加機能の呼び出し
    const path = await window.service.settings.selectPhotoDirectoryLocation();
    if (path) {
      // ディレクトリリストに追加
      setPhotoDirectoryPaths([...photoDirectoryPaths, path]);
    }
  };

  const deletePhotoDirectoryPath = async (path: string) => {
    // ディレクトリリストから削除
    setPhotoDirectoryPaths(photoDirectoryPaths.filter((item) => item !== path));
  };

  const apply = async () => {
    setApplyStatus('LOADING');
    const updateResult = await window.service.settings.updateFileSetting({
      databaseFilePath,
      imageDirectoryPaths: photoDirectoryPaths,
    });
    const scanResult = await window.service.log.scanPhoto(true);
    if (updateResult.status === 'success' && scanResult.status === 'success') {
      dispatch(getActivity());
      dispatch(getWorld());
    } else if (updateResult.status === 'failed') {
      setApplyStatus('ERROR');
      setErrorMessage(updateResult.message ?? '');
    } else if (scanResult.status === 'failed') {
      setApplyStatus('ERROR');
      setErrorMessage(scanResult.message);
    }
  };

  return (
    <Setting
      show={mode === 'SETTING'}
      databaseFilePath={databaseFilePath}
      photoDirectoryPaths={photoDirectoryPaths}
      showUpdateDatabaseFilePathDialog={showUpdateDatabaseFilePathDialog}
      showAddPhotoDirectoryDialog={showAddPhotoDirectoryDialog}
      deletePhotoDirectoryPath={deletePhotoDirectoryPath}
      apply={apply}
      errorMessage={errorMessage}
      applyStatus={applyStatus}
      version={version}
    />
  );
};
export default SettingContainer;
