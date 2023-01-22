import { useQuery } from 'react-query';
import styled from 'styled-components';
import WorldThumbnail from '../../component/common/WorldThumbnail';
import WorldThumbnailContainer from './WorldThumbnailContainer';

interface Props {
  worldName: string;
  instanceId: string;
  joinDate: Date;
  estimateLeftDate: Date;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const LazyWorldThumbnailContainer: React.FC<Props> = (props) => {
  // 0.5秒はサムネ表示せずに読み込み中表示にする
  const { isLoading } = useQuery(
    `LAZY_PHOTO_COUNT_${props.instanceId}_${props.joinDate?.toISOString()}` ??
      'USER_COUNT_NONE',
    () => {
      return new Promise((resolve) => setTimeout(resolve, 500));
    }
  );
  if (isLoading) {
    return (
      <Wrapper>
        <WorldThumbnail
          isLoading
          worldName={props.worldName}
          photoCount={null}
          userCount={null}
        />
      </Wrapper>
    );
  }
  return (
    <WorldThumbnailContainer
      worldName={props.worldName}
      instanceId={props.instanceId}
      joinDate={props.joinDate}
      estimateLeftDate={props.estimateLeftDate}
    />
  );
};
export default LazyWorldThumbnailContainer;
