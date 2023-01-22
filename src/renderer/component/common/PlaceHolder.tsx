import styled from 'styled-components';
import React from 'react';

interface Prop {
  height: number;
}

const Wrapper = styled.div<{ height: number }>`
  height: ${({ height }) => height};
`;

const PlaceHolder: React.FC<Prop> = (props) => {
  return <Wrapper height={props.height} />;
};
export default PlaceHolder;
