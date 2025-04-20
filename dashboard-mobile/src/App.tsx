// src/App.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '@/store';
import RootNavigator from '@/navigation/RootNavigator';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';
import setupI18n from '@/lib/i18n';

const App = () => {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await setupI18n();
      setI18nReady(true);
    };
    initialize();
  }, []);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <SafeAreaProvider>
            <SocketProvider>
              <NavigationContainer>
                <StatusBar
                  barStyle="dark-content"
                  backgroundColor="transparent"
                  translucent
                />
                <RootNavigator />
              </NavigationContainer>
            </SocketProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
