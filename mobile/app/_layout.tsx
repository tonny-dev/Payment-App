import React from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastProvider } from '@components/ToastProvider';
import { persistor, store } from '@store/index';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200EE',
    accent: '#03DAC6',
  },
};

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <ToastProvider>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen name="index" options={{ title: 'Login' }} />
              <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
              <Stack.Screen name="dashboard" options={{ title: 'Dashboard', headerLeft: () => null }} />
              <Stack.Screen name="send-payment" options={{ title: 'Send Payment' }} />
            </Stack>
          </ToastProvider>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
