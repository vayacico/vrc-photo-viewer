import styled, { createGlobalStyle } from 'styled-components';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Wrapper = styled.div`
  top: 32px;
  left: 60px;
  width: calc(100% - 60px);
  height: calc(100% - 32px - 24px);
  position: fixed;
  background-color: #fff;
  user-select: none;
`;

const GlobalStyle = createGlobalStyle`
  button {
    border: none;
    background-color: transparent;
  }
`;

const Contents: React.FC<Props> = (props) => {
  return (
    <Wrapper>
      <GlobalStyle />
      {props.children}
    </Wrapper>
  );
};
export default Contents;
