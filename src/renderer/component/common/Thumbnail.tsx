import styled from 'styled-components';
import React from 'react';
import { Skeleton } from '@chakra-ui/react';

interface Props {
  isLoading: boolean;
  thumbnailPath?: string | null;
  onClick?: () => void;
  onDrag?: (e: React.DragEvent) => void;
}

const Image = styled.img`
  max-width: 100%;
  height: 100%;
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  font-size: 0;
  margin: 2px;
  vertical-align: bottom;
`;

const Thumbnail: React.FC<Props> = (props) => {
  return (
    <ImageWrapper onDragStart={props.onDrag}>
      <Skeleton isLoaded={!props.isLoading} height="100%" speed={2}>
        {props.thumbnailPath ? (
          <Image src={props.thumbnailPath} onClick={props.onClick} />
        ) : null}
      </Skeleton>
    </ImageWrapper>
  );
};
export default Thumbnail;
