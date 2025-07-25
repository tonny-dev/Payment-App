import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SendPaymentScreen from '@screens/SendPaymentScreen';
import DashboardScreen from '@screens/DashboardScreen';
import LoginScreen from '@screens/LoginScreen';
import SignUpScreen from '@screens/SignUpScreen';
import { ToastProvider } from '@components/ToastProvider';
import { persistor, RootState, store } from '@store/index';
import { RootStackParamList } from '@_types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200EE',
    accent: '#03DAC6',
  },
};

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <ToastProvider>
            <NavigationContainer>
              <AuthNavigator />
            </NavigationContainer>
          </ToastProvider>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

const AuthNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  if (isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerLeft: () => null }}
        />
        <Stack.Screen name="SendPayment" component={SendPaymentScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default App;
