import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import Menu from '../../component/main/Menu';
import { pageModeActions } from '../../reducers/pageMode';
import { State } from '../../reducers';

const MenuContainer: React.FC = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: State) => state.pageMode.current.mode);

  const onClickGalleryButton = () => {
    if (mode !== 'GALLERY' && mode !== 'PHOTO_DETAIL_FOR_GALLERY') {
      dispatch(pageModeActions.replace({ mode: 'GALLERY' }));
    }
  };

  const onClickWorldButton = () => {
    dispatch(pageModeActions.replace({ mode: 'WORLD' }));
  };

  const onClickSearchButton = () => {
    dispatch(pageModeActions.replace({ mode: 'SEARCH' }));
  };

  const onClickSettingButton = () => {
    dispatch(pageModeActions.replace({ mode: 'SETTING' }));
  };

  const onClickSummaryButton = () => {
    dispatch(pageModeActions.replace({ mode: 'SUMMARY' }));
  };

  return (
    <Menu
      onClickGalleryButton={onClickGalleryButton}
      onClickWorldButton={onClickWorldButton}
      onClickSettingButton={onClickSettingButton}
      onClickSearchButton={onClickSearchButton}
      onClickSummaryButton={onClickSummaryButton}
      pageMode={mode}
    />
  );
};
export default MenuContainer;
