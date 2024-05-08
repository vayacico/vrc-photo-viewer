import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useState } from 'react';
import createStore from './createStore';
import TitleBarContainer from './container/main/TitleBarContainer';
import MenuContainer from './container/main/MenuContainer';
import ContentContainer from './container/main/ContentContainer';
import StatusBarContainer from './container/main/StatusBarContainer';
import en from '../i18n/locales/en.json';
import ja from '../i18n/locales/ja.json';
import { ScanResultResponse } from '../dto/ScanResult';

export default function App() {
  const queryClient = new QueryClient();

  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: en,
      },
      ja: {
        translation: ja,
      },
    },
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scanPhoto = async (isRefresh: boolean) => {
    if (isScanning) {
      return {
        status: 'isScanning',
        photoCount: 0,
        oldPhotoCount: 0,
      } as ScanResultResponse;
    }
    setIsScanning(true);
    const response = await window.service.log.scanPhoto(isRefresh);
    setIsScanning(false);
    return response;
  };

  return (
    <ChakraProvider resetCSS={false}>
      <Provider store={createStore}>
        <QueryClientProvider client={queryClient}>
          <TitleBarContainer />
          <MenuContainer />
          <ContentContainer isScanning={isScanning} scanPhoto={scanPhoto} />
          <StatusBarContainer isScanning={isScanning} scanPhoto={scanPhoto} />
        </QueryClientProvider>
      </Provider>
    </ChakraProvider>
  );
}
