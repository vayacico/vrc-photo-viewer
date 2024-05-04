import styled, { css } from 'styled-components';
import {
  BsCardImage,
  BsClipboardData,
  BsGearFill,
  BsGlobe,
  BsSearch,
} from 'react-icons/bs';
import React from 'react';
import { Mode } from '../../reducers/pageMode';

interface Props {
  onClickGalleryButton: (e: React.MouseEvent) => void;
  onClickSettingButton: (e: React.MouseEvent) => void;
  onClickWorldButton: (e: React.MouseEvent) => void;
  onClickSearchButton: (e: React.MouseEvent) => void;
  onClickSummaryButton: (e: React.MouseEvent) => void;
  pageMode: Mode;
}

const Wrapper = styled.div`
  position: fixed;
  top: 32px;
  left: 0;
  background-color: #ececed;
  border-right: 1px #e0e0e2 solid;
  width: 59px;
  height: calc(100% - 32px - 24px);
`;

const Button = styled.button`
  background-color: transparent;
  width: 60px;
  height: 60px;
  border: none;
`;

const PhotoIcon = styled(BsCardImage)<{ selected: boolean }>`
  font-size: 2em;
  ${(props) =>
    props.selected
      ? css`
          color: #252424;
        `
      : css`
          color: #8e8e8e;
        `}
`;

const WorldButton = styled(BsGlobe)<{ selected: boolean }>`
  font-size: 2em;
  ${(props) =>
    props.selected
      ? css`
          color: #252424;
        `
      : css`
          color: #8e8e8e;
        `}
`;

const SearchButton = styled(BsSearch)<{ selected: boolean }>`
  font-size: 2em;
  ${(props) =>
    props.selected
      ? css`
          color: #252424;
        `
      : css`
          color: #8e8e8e;
        `}
`;

const SummaryButton = styled(BsClipboardData)<{ selected: boolean }>`
  font-size: 2em;
  ${(props) =>
    props.selected
      ? css`
          color: #252424;
        `
      : css`
          color: #8e8e8e;
        `}
`;

const SettingButton = styled(BsGearFill)<{ selected: boolean }>`
  font-size: 2em;
  ${(props) =>
    props.selected
      ? css`
          color: #252424;
        `
      : css`
          color: #8e8e8e;
        `}
`;

const Menu: React.FC<Props> = (props) => {
  return (
    <Wrapper>
      <Button onClick={props.onClickGalleryButton}>
        <PhotoIcon
          selected={
            props.pageMode === 'GALLERY' ||
            props.pageMode === 'PHOTO_DETAIL_FOR_GALLERY'
          }
        />
      </Button>
      <Button onClick={props.onClickWorldButton}>
        <WorldButton selected={props.pageMode === 'WORLD'} />
      </Button>
      <Button onClick={props.onClickSearchButton}>
        <SearchButton selected={props.pageMode === 'SEARCH'} />
      </Button>
      <Button onClick={props.onClickSummaryButton}>
        <SummaryButton selected={props.pageMode === 'SUMMARY'} />
      </Button>
      <Button onClick={props.onClickSettingButton}>
        <SettingButton selected={props.pageMode === 'SETTING'} />
      </Button>
    </Wrapper>
  );
};
export default Menu;
