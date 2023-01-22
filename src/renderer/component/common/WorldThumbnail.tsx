import styled from 'styled-components';
import React from 'react';
import { BsCardImage, BsFillPersonFill } from 'react-icons/bs';
import { Skeleton } from '@chakra-ui/react';

interface Props {
  isLoading: boolean;
  thumbnailPath?: string;
  worldName?: string;
  instanceId?: string;
  photoCount?: number | null;
  userCount?: number | null;
  onClick?: VoidFunction;
  setStatus?: (text: string) => void;
}

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  font-size: 0;
  vertical-align: bottom;
  margin: 2px;
  position: relative;
`;

const Image = styled.img`
  width: 100%;
`;

const CaptionArea = styled.div`
  height: 32px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  position: absolute;
  bottom: -2px;
  display: flex;
`;

const WorldName = styled.p`
  margin-bottom: 4px;
  position: absolute;
  bottom: 0;
  left: 8px;
  font-family: '游ゴシック', system-ui;
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: calc(100% - 120px - 30px);

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const InstanceInfo = styled.div`
  width: 120px;
  height: 30px;
  position: absolute;
  right: 8px;
  bottom: 0;
  margin-bottom: 4px;
  display: flex;
`;

const PhotoIcon = styled(BsCardImage)`
  width: 20px;
  height: 20px;
  margin-top: 8px;
  font-size: 1em;
  color: white;
`;

const PersonIcon = styled(BsFillPersonFill)`
  width: 20px;
  height: 20px;
  margin-top: 8px;
  font-size: 1em;
  color: white;
`;

const Count = styled.p`
  font-size: 16px;
  color: white;
  margin-top: 6px;
  margin-left: 8px;
  margin-right: 16px;
`;

const WorldThumbnail: React.FC<Props> = (props) => {
  const ids = props.instanceId && props.instanceId.split(':');
  const url = `https://vrchat.com/home/world/${
    ids && ids.length !== 0 ? ids[0] : ''
  }`;

  return (
    <ImageWrapper
      onDragStart={(e) => {
        e.preventDefault();
      }}
    >
      <Skeleton isLoaded={!props.isLoading} speed={2} height="100%">
        {props.thumbnailPath ? (
          <Image src={props.thumbnailPath} onClick={props.onClick} />
        ) : null}
      </Skeleton>
      <CaptionArea>
        <WorldName
          onClick={() => window.service.application.openUrlInBrowser(url)}
          onMouseEnter={() => props.setStatus && props.setStatus(url)}
          onMouseLeave={() => props.setStatus && props.setStatus('')}
        >
          {props.worldName}
        </WorldName>
        <InstanceInfo>
          <PhotoIcon />
          <Count>{props.photoCount ?? ' - '}</Count>
          <PersonIcon />
          <Count>{props.userCount ?? ' - '}</Count>
        </InstanceInfo>
      </CaptionArea>
    </ImageWrapper>
  );
};
export default WorldThumbnail;
