import { useDispatch } from 'react-redux';
import TitleBar from '../../component/main/TitleBar';
import { pageModeActions } from '../../reducers/pageMode';

const TitleBarContainer: React.FC = () => {
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    dispatch(pageModeActions.back());
  };

  const onClickMinimize = () => {
    return window.service.application.minimize();
  };

  const onClickSizeChange = () => {
    return window.service.application.sizeChange();
  };

  const onClickClose = () => {
    return window.service.application.close();
  };

  return (
    <TitleBar
      onClickBackButton={onClickBackButton}
      onClickMinimize={onClickMinimize}
      onClickSizeChange={onClickSizeChange}
      onClickClose={onClickClose}
    />
  );
};
export default TitleBarContainer;
