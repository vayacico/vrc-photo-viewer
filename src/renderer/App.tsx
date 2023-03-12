import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import createStore from './createStore';
import TitleBarContainer from './container/main/TitleBarContainer';
import MenuContainer from './container/main/MenuContainer';
import ContentContainer from './container/main/ContentContainer';
import StatusBarContainer from './container/main/StatusBarContainer';
import ApplicationServiceImpl from './services/impl/applicationImpl';
import LogServiceImpl from './services/impl/logImpl';
import SearchServiceImpl from './services/impl/searchImpl';
import ThumbnailServiceImpl from './services/impl/thumbnailImpl';
import SettingServiceImpl from './services/impl/settingImpl';

export default function App() {
  const queryClient = new QueryClient();

  if (navigator.userAgent.includes('Electron')) {
    console.log('running in electron');
    window.environment = 'electron';
  } else {
    window.environment = 'browser';
    window.service = {
      log: new LogServiceImpl(),
      search: new SearchServiceImpl(),
      settings: new SettingServiceImpl(),
      thumbnail: new ThumbnailServiceImpl(),
      application: new ApplicationServiceImpl(),
    };
  }

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
