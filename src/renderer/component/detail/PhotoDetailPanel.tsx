import styled from 'styled-components';
import {
  BsCheck2,
  BsCopy,
  BsFillCalendarEventFill,
  BsFillCameraFill,
  BsFillFileEarmarkTextFill,
  BsFillPersonFill,
  BsGlobe,
  BsLink45Deg,
} from 'react-icons/bs';
import React, { useEffect, useState } from 'react';
import { Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

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
  margin-right: 16px;
  color: #38393d;
  font-weight: 500;
  max-width: 300px;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const PathItem = styled.h2`
  font-size: 18px;
  font-family: '游ゴシック', system-ui;
  margin-top: 0;
  margin-left: 16px;
  margin-bottom: 4px;
  margin-right: 16px;
  color: #38393d;
  font-weight: 500;
  max-width: 300px;
  word-break: break-all;

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
  margin-right: 20px;
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
const CopyIconWrapper = styled.span`
  width: 24px;
  height: 32px;
  font-size: 16px;
`;
const CopyIcon = styled(BsCopy)`
  color: #6e6e6e;

  &:hover {
    color: #38393d;
  }
`;
const UrlCopyIcon = styled(BsLink45Deg)`
  color: #888787;
  font-size: 1.4em;

  &:hover {
    color: #38393d;
  }
`;
const CustomCheckIcon = styled(BsCheck2)`
  color: #188036;
`;

const PhotoDetailPanel: React.FC<Props> = (props) => {
  const ids = props.instanceId && props.instanceId.split(':');
  const url = `https://vrchat.com/home/world/${
    ids && ids.length !== 0 ? ids[0] : ''
  }`;
  const splitedPath = props.originalFilePath.split('\\');
  const fileName = splitedPath[splitedPath.length - 1];

  const [worldNameCopied, setWorldNameCopied] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [t] = useTranslation();

  useEffect(() => {
    setWorldNameCopied(false);
    setPathCopied(false);
    setUrlCopied(false);
  }, [props.originalFilePath, props.worldName]);

  const copyWorldNameToClipboard = () => {
    navigator.clipboard.writeText(props.worldName);
    setWorldNameCopied(true);
    setTimeout(() => {
      setWorldNameCopied(false);
    }, 5000);
  };

  const copyPathToClipboard = () => {
    navigator.clipboard.writeText(props.originalFilePath);
    setPathCopied(true);
    setTimeout(() => {
      setPathCopied(false);
    }, 5000);
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => {
      setUrlCopied(false);
    }, 5000);
  };

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
        <Tooltip
          label={worldNameCopied ? t('panel.copied') : t('panel.copyWorldName')}
          placement="top"
          closeOnClick={false}
        >
          <CopyIconWrapper onClick={() => copyWorldNameToClipboard()}>
            {worldNameCopied ? <CustomCheckIcon /> : <CopyIcon />}
          </CopyIconWrapper>
        </Tooltip>
        <Tooltip
          label={urlCopied ? t('panel.copied') : t('panel.copyWorldUrl')}
          placement="top"
          closeOnClick={false}
        >
          <CopyIconWrapper onClick={() => copyUrlToClipboard()}>
            {urlCopied ? <CustomCheckIcon /> : <UrlCopyIcon />}
          </CopyIconWrapper>
        </Tooltip>
      </IconTextWrapper>
      <IconTextWrapper>
        <CalendarIcon />
        <Item>
          {`${props.joinDate.toLocaleDateString()} ${props.joinDate.toLocaleTimeString()}`}
        </Item>
      </IconTextWrapper>
      <IconTextWrapper>
        <PhotoFileIcon />
        <PathItem
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
        </PathItem>
        <Tooltip
          label={pathCopied ? t('panel.copied') : t('panel.copyFilePath')}
          placement="top"
          closeOnClick={false}
        >
          <CopyIconWrapper onClick={() => copyPathToClipboard()}>
            {pathCopied ? <CustomCheckIcon /> : <CopyIcon />}
          </CopyIconWrapper>
        </Tooltip>
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
