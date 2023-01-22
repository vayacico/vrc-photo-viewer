import { useQuery } from 'react-query';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import Thumbnail from '../../component/common/Thumbnail';

interface Props {
  originalFilePath?: string;
  onClick?: VoidFunction;
}

const ThumbnailContainer: React.FC<Props> = (props) => {
  const [ref, isView] = useInView();

  const { data } = useQuery(
    props.originalFilePath ?? 'NONE',
    () => {
      if (props.originalFilePath) {
        return window.service.thumbnail.getThumbnail(props.originalFilePath);
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

  if (!props.originalFilePath) {
    return <Thumbnail isLoading={false} />;
  }

  const onDragStart = (event: React.DragEvent) => {
    if (props.originalFilePath) {
      event.preventDefault();
      window.service.application.onDrag(props.originalFilePath);
    }
  };

  return (
    <div ref={ref} style={{ height: '100%' }}>
      <Thumbnail
        isLoading={!data}
        thumbnailPath={data}
        onClick={props.onClick}
        onDrag={onDragStart}
      />
    </div>
  );
};
export default ThumbnailContainer;
