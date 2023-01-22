import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import WorldThumbnail from '../../component/common/WorldThumbnail';
import { State } from '../../reducers';
import { pageModeActions } from '../../reducers/pageMode';
import { statusActions } from '../../reducers/status';

interface Props {
  worldName: string;
  instanceId: string;
  joinDate: Date;
  estimateLeftDate: Date;
}

const RefWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const WorldThumbnailContainer: React.FC<Props> = (props) => {
  const photo = useSelector((state: State) => state.imageGallery.photo);
  const dispatch = useDispatch();

  const [ref, isView] = useInView();

  const setStatus = (text: string) => {
    dispatch(statusActions.setStatus({ text }));
  };

  // ユーザー数の取得
  const { data: userCount } = useQuery(
    `USER_COUNT_${props.instanceId}_${props.joinDate?.toISOString()}` ??
      'USER_COUNT_NONE',
    async () => {
      if (props.instanceId && props.joinDate && props.estimateLeftDate) {
        return window.service.log.getUsers(
          props.joinDate,
          props.estimateLeftDate
        );
      }
      return null;
    },
    {
      // 表示されているときのみ取得
      enabled: isView,
      retry: () => isView,
      retryDelay: 100,
    }
  );

  // 写真の取得
  const { isLoading: imageIsLoading, data: imageData } = useQuery(
    `PHOTO_COUNT_${props.instanceId}_${props.joinDate?.toISOString()}` ??
      'USER_COUNT_NONE',
    async () => {
      if (photo === null) {
        return null;
      }
      const result = photo.filter(
        (item) =>
          props.joinDate <= item.createdDate &&
          item.createdDate < props.estimateLeftDate
      );
      if (result && result.length !== 0) {
        return {
          thumbnailPath: await window.service.thumbnail.getThumbnail(
            result[0].originalFilePath
          ),
          count: result.length,
        };
      }
      return null;
    },
    {
      // 表示されているときのみ取得
      enabled: isView,
      retry: true,
      retryDelay: 100,
    }
  );

  if (!props.instanceId) {
    return (
      <RefWrapper ref={ref}>
        <WorldThumbnail isLoading={false} />
      </RefWrapper>
    );
  }

  const onClick = () => {
    dispatch(
      pageModeActions.replace({
        mode: 'GALLERY',
        scrollInstanceId: `${props.instanceId}-${props.joinDate}`,
      })
    );
  };

  if (imageIsLoading || !imageData) {
    return (
      <RefWrapper ref={ref}>
        <WorldThumbnail
          isLoading
          worldName={props.worldName}
          photoCount={null}
          userCount={userCount ? userCount.length : null}
        />
      </RefWrapper>
    );
  }

  return (
    <RefWrapper ref={ref}>
      <WorldThumbnail
        isLoading={!imageData.thumbnailPath}
        thumbnailPath={imageData.thumbnailPath}
        instanceId={props.instanceId}
        worldName={props.worldName}
        photoCount={imageData ? imageData.count : null}
        userCount={userCount ? userCount.length : null}
        onClick={onClick}
        setStatus={setStatus}
      />
    </RefWrapper>
  );
};
export default WorldThumbnailContainer;
