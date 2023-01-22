import styled from 'styled-components';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Wrapper = styled.div`
  height: calc(100% - 4px);
  display: flex;
  justify-content: space-between;
  column-gap: 2px;
`;

const RowWrapper: React.FC<Props> = (props) => {
  return <Wrapper>{props.children}</Wrapper>;
};
export default RowWrapper;
