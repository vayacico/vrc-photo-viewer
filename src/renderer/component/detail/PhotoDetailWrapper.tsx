import styled, { css } from 'styled-components';
import React from 'react';

interface Props {
  children: React.ReactNode;
  show: boolean;
}

const Wrapper = styled.div<{ show: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;

  ${(props) =>
    !props.show
      ? css`
          display: none;
        `
      : ''}
`;

const PhotoDetailWrapper: React.FC<Props> = (props) => {
  return <Wrapper show={props.show}>{props.children}</Wrapper>;
};
export default PhotoDetailWrapper;
