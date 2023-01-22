import styled from 'styled-components';
import { BsFillImageFill } from 'react-icons/bs';

interface Props {
  text: string;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Inner = styled.div`
  width: 500px;
  height: 300px;
  position: absolute;
  top: 120px;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled(BsFillImageFill)`
  font-size: 5em;
  color: #dadada;
`;

const Text = styled.p`
  text-align: center;
  font-size: 1.5em;
  color: #dadada;
`;

const EmptyPanel: React.FC<Props> = (props) => {
  return (
    <Wrapper>
      <Inner>
        <IconWrapper>
          <Icon />
        </IconWrapper>
        <Text>{props.text}</Text>
      </Inner>
    </Wrapper>
  );
};
export default EmptyPanel;
