import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import createStore from './createStore';
import en from '../i18n/locales/en.json';
import ja from '../i18n/locales/ja.json';
import WindowContainer from './container/main/WindowContainer';

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

  return (
    <ChakraProvider resetCSS={false}>
      <Provider store={createStore}>
        <QueryClientProvider client={queryClient}>
          <WindowContainer />
        </QueryClientProvider>
      </Provider>
    </ChakraProvider>
  );
}
