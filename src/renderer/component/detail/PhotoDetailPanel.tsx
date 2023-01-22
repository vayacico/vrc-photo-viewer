import styled from 'styled-components';
import {
  BsFillCalendarEventFill,
  BsFillCameraFill,
  BsFillFileEarmarkTextFill,
  BsFillPersonFill,
  BsGlobe,
} from 'react-icons/bs';
import React from 'react';

interface Props {
  worldName: string;
  instanceId: string;
  joinDate: Date;
  createdDate: Date;
  originalFilePath: string;
  users: string[];
  setStatus: (text: string) => void;
}

const DetailPanel = styled.div`
  width: 400px;
  background-color: #e0e0e0;
  overflow-y: scroll;
  padding-top: 20px;
`;

const LinkItem = styled.h2`
  font-size: 18px;
  font-family: '游ゴシック', system-ui;
  margin-top: 0;
  margin-left: 16px;
  margin-bottom: 4px;
  color: #38393d;
  font-weight: 500;
  max-width: 300px;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Item = styled.h2`
  font-size: 18px;
  font-family: '游ゴシック', system-ui;
  margin-top: 0;
  margin-left: 16px;
  margin-bottom: 4px;
  color: #38393d;
  font-weight: 500;
  max-width: 300px;
  user-select: text;
`;

const IconTextWrapper = styled.div`
  display: flex;
  margin-left: 20px;
  margin-bottom: 20px;
`;

const WorldIcon = styled(BsGlobe)`
  font-size: 18px;
  margin-top: 4px;
`;

const CalendarIcon = styled(BsFillCalendarEventFill)`
  font-size: 18px;
  margin-top: 4px;
`;

const PersonIcon = styled(BsFillPersonFill)`
  font-size: 20px;
  margin-top: 4px;
`;

const CameraIcon = styled(BsFillCameraFill)`
  font-size: 20px;
  margin-top: 4px;
`;

const Users = styled.div``;

const User = styled.div`
  display: flex;
`;

const PhotoFileIcon = styled(BsFillFileEarmarkTextFill)`
  font-size: 20px;
  margin-top: 4px;
`;

const PhotoDetailPanel: React.FC<Props> = (props) => {
  const ids = props.instanceId && props.instanceId.split(':');
  const url = `https://vrchat.com/home/world/${
    ids && ids.length !== 0 ? ids[0] : ''
  }`;
  const splitedPath = props.originalFilePath.split('\\');
  const fileName = splitedPath[splitedPath.length - 1];

  return (
    <DetailPanel>
      <IconTextWrapper>
        <WorldIcon />
        <LinkItem
          onClick={() => window.service.application.openUrlInBrowser(url)}
          onMouseEnter={() => props.setStatus && props.setStatus(url)}
          onMouseLeave={() => props.setStatus && props.setStatus('')}
        >
          {props.worldName}
        </LinkItem>
      </IconTextWrapper>
      <IconTextWrapper>
        <CalendarIcon />
        <Item>
          {`${props.joinDate.toLocaleDateString()} ${props.joinDate.toLocaleTimeString()}`}
        </Item>
      </IconTextWrapper>
      <IconTextWrapper>
        <PhotoFileIcon />
        <LinkItem
          onClick={() =>
            window.service.application.openFileInDefaultApplication(
              props.originalFilePath
            )
          }
          onMouseEnter={() =>
            props.setStatus && props.setStatus(props.originalFilePath)
          }
          onMouseLeave={() => props.setStatus && props.setStatus('')}
        >
          {fileName}
        </LinkItem>
      </IconTextWrapper>
      <IconTextWrapper>
        <CameraIcon />
        <Item>
          {`${props.createdDate.toLocaleDateString()} ${props.createdDate.toLocaleTimeString()}`}
        </Item>
      </IconTextWrapper>
      <IconTextWrapper>
        <PersonIcon />
        <Users>
          {props.users.map((item) => {
            return (
              <User>
                <Item>{item}</Item>
              </User>
            );
          })}
        </Users>
      </IconTextWrapper>
    </DetailPanel>
  );
};
export default PhotoDetailPanel;
