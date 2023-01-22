import { useQuery } from 'react-query';
import styled from 'styled-components';
import ThumbnailContainer from './ThumbnailContainer';
import Thumbnail from '../../component/common/Thumbnail';

interface Props {
  originalFilePath?: string;
  onClick?: VoidFunction;
}

const Wrapper = styled.div`
  width: 100%;
`;

const LazyThumbnailContainer: React.FC<Props> = (props) => {
  // 0.5秒はサムネ表示せずに読み込み中表示にする
  const { isLoading } = useQuery(
    `LAZY_${props.originalFilePath}` ?? 'NONE',
    () => {
      return new Promise((resolve) => setTimeout(resolve, 500));
    }
  );

  return (
    <Wrapper>
      {isLoading ? (
        <div>
          <Thumbnail isLoading />
        </div>
      ) : (
        <ThumbnailContainer
          originalFilePath={props.originalFilePath}
          onClick={props.onClick}
        />
      )}
    </Wrapper>
  );
};
export default LazyThumbnailContainer;
