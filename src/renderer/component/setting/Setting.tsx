import styled, { css } from 'styled-components';
import { BsCheckLg, BsFillPencilFill, BsX } from 'react-icons/bs';
import React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Icon,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
  show: boolean;
  databaseFilePath: string | null;
  photoDirectoryPaths: string[];
  applyStatus: 'NOT_YET' | 'LOADING' | 'SUCCESS' | 'ERROR';
  language: string;
  setLanguage: (lang: string) => void;
  errorMessage: string | null;
  version: string;
  showUpdateDatabaseFilePathDialog: () => Promise<void>;
  showAddPhotoDirectoryDialog: () => Promise<void>;
  deletePhotoDirectoryPath: (path: string) => Promise<void>;
  apply: () => Promise<void>;
}

const Wrapper = styled.div<{ show: boolean }>`
  padding-top: 8px;
  padding-left: 12px;

  ${(props) =>
    !props.show
      ? css`
          display: none;
        `
      : ''}
`;

const Area = styled.div`
  margin-bottom: 20px;
`;

const Heading = styled.h1`
  font-size: 20px;
  font-family: system-ui;
  margin-top: 4px;
  margin-bottom: 0;
  color: #656565;
  font-weight: 800;
`;

const Description = styled.h2`
  font-size: 18px;
  color: #656565;
  font-family: system-ui;
  font-weight: 100;
  margin-top: 0;
`;

const PathArea = styled.div`
  background-color: #fff;
  border: 1px solid #bbbaba;
  border-radius: 2px;
  margin-bottom: 8px;
  padding: 2px;
  position: relative;
  height: 1.5em;
  font-family: system-ui;
  font-weight: 100;
`;

const Path = styled.div`
  padding: 2px;
  font-size: 14px;
  position: absolute;
  left: 4px;
  color: #656565;
`;

const AddDirectButton = styled.button`
  background-color: #fff;
  border: 1px solid #bbbaba;
  position: relative;
  height: 24px;
  color: #656565;
  font-size: 1em;

  &:hover {
    background-color: #e5e5e5;
  }

  &:active {
    background-color: #a9a9a9;
  }
`;

const EditIcon = styled.div`
  position: absolute;
  right: 8px;
  top: 6px;
  color: #bbbaba;
  font-size: 0.8em;

  &:hover {
    color: #6b6b6b;
  }

  &:active {
    color: #4f4f4f;
  }
`;

const DeleteIcon = styled.div`
  position: absolute;
  right: 4px;
  top: 2px;
  color: #bbbaba;
  font-size: 1.2em;

  &:hover {
    color: #6b6b6b;
  }

  &:active {
    color: #4f4f4f;
  }
`;

const ApplyButton = styled(Button)`
  border-radius: 0;
!important;
  margin-top: 16px;
  margin-bottom: 10px;
  color: #656565;
  font-family: system-ui;
!important;
  font-weight: 400;
!important;

`;

const NormalButton = styled(Button)`
  border-radius: 0;
!important;
  margin-top: 16px;
  margin-bottom: 10px;
  color: #656565;
  font-family: system-ui;
!important;
  font-weight: 400;
!important;
`;

const LinkText = styled.a`
  color: cornflowerblue;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Setting: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const photoDirectoryBoxes = props.photoDirectoryPaths.map((item) => {
    return (
      <PathArea>
        <Path> {item}</Path>
        <DeleteIcon onClick={() => props.deletePhotoDirectoryPath(item)}>
          <BsX />
        </DeleteIcon>
      </PathArea>
    );
  });

  return (
    <Wrapper show={props.show}>
      <Tabs marginRight="10px">
        <TabList>
          <Tab>{t('setting.tab.file')}</Tab>
          <Tab>{t('setting.tab.setting')}</Tab>
          <Tab>{t('setting.tab.about')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Area>
              <Heading>{t('setting.db.heading')}</Heading>
              <Description>{t('setting.db.description')}</Description>

              <PathArea>
                <Path>{props.databaseFilePath ?? ''}</Path>
                <EditIcon
                  onClick={() => props.showUpdateDatabaseFilePathDialog()}
                >
                  <BsFillPencilFill />
                </EditIcon>
              </PathArea>
            </Area>
            <Area>
              <Heading>{t('setting.photoFolders.heading')}</Heading>
              <Description>{t('setting.photoFolders.description')}</Description>
              {photoDirectoryBoxes}
              <AddDirectButton
                onClick={() => props.showAddPhotoDirectoryDialog()}
              >
                +
              </AddDirectButton>
            </Area>
            <ApplyButton
              isLoading={props.applyStatus === 'LOADING'}
              loadingText="Loading"
              size="sm"
              borderRadius={0}
              variant="solid"
              colorScheme="blue"
              onClick={() => props.apply()}
              leftIcon={<Icon as={BsCheckLg} />}
            >
              {t('setting.apply.button')}
            </ApplyButton>

            {props.applyStatus === 'SUCCESS' ? (
              <Alert status="success" width="95%">
                <AlertIcon />
                {t('setting.apply.successMessage')}
              </Alert>
            ) : null}
            {props.applyStatus === 'ERROR' ? (
              <Alert status="error" width="95%">
                <AlertIcon />
                {t('setting.apply.errorMessage')} <br />
                {props.errorMessage}
              </Alert>
            ) : null}
          </TabPanel>
          <TabPanel>
            <Area>
              <Heading>{t('setting.language.heading')}</Heading>
              <Description>{t('setting.language.description')}</Description>
              <Select
                size="sm"
                borderRadius={0}
                value={props.language}
                onChange={(value: { target: { value: string } }) =>
                  props.setLanguage(value.target.value)
                }
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </Select>
            </Area>
            <Area>
              <Heading>{t('setting.settingFile.heading')}</Heading>
              <Description>
                {t('setting.settingFile.description')} <br />
                <NormalButton
                  size="sm"
                  borderRadius={0}
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => window.service.settings.openSettingFile()}
                >
                  {t('setting.settingFile.button')}
                </NormalButton>
              </Description>
            </Area>
            <Area>
              <Heading>{t('setting.thumbnailCache.heading')}</Heading>
              <Description>
                {t('setting.thumbnailCache.description')}
                <br />
                <NormalButton
                  size="sm"
                  borderRadius={0}
                  variant="outline"
                  colorScheme="blue"
                  onClick={() =>
                    window.service.thumbnail.openThumbnailDirectory()
                  }
                >
                  {t('setting.thumbnailCache.button')}
                </NormalButton>
              </Description>
            </Area>
          </TabPanel>
          <TabPanel>
            <Area>
              <Heading>{t('setting.version.heading')}</Heading>
              <Description>
                {props.version}
                <br />
                <LinkText
                  onClick={() =>
                    window.service.application.openUrlInBrowser(
                      'https://github.com/vayacico/vrc-photo-viewer'
                    )
                  }
                >
                  https://github.com/vayacico/vrc-photo-viewer
                </LinkText>
              </Description>
            </Area>
            <Area>
              <Heading>{t('setting.license.heading')}</Heading>

              <Description>
                {t('setting.license.description')}
                <br />
                <LinkText
                  onClick={() => window.service.application.openLicenceFile()}
                >
                  Third Party Licenses
                </LinkText>
              </Description>
            </Area>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Wrapper>
  );
};
export default Setting;
