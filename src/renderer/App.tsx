import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import createStore from './createStore';
import TitleBarContainer from './container/main/TitleBarContainer';
import MenuContainer from './container/main/MenuContainer';
import ContentContainer from './container/main/ContentContainer';
import StatusBarContainer from './container/main/StatusBarContainer';

export default function App() {
  const queryClient = new QueryClient();

  return (
    <ChakraProvider resetCSS={false}>
      <Provider store={createStore}>
        <QueryClientProvider client={queryClient}>
          <TitleBarContainer />
          <MenuContainer />
          <ContentContainer />
          <StatusBarContainer />
        </QueryClientProvider>
      </Provider>
    </ChakraProvider>
  );
}
