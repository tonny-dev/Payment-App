import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SendPaymentScreen from './src/screens/SendPaymentScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import { ToastProvider } from './src/components/ToastProvider';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { persistor, RootState, store } from './src/store/index';
import { RootStackParamList } from './src/types/navigation';
import { paperTheme, colors } from './src/theme';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <PaperProvider theme={paperTheme}>
            <ToastProvider>
              <StatusBar style="light" backgroundColor={colors.primary} />
              <NavigationContainer>
                <AuthNavigator />
              </NavigationContainer>
            </ToastProvider>
          </PaperProvider>
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

const AuthNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  const screenOptions = {
    headerShown: false, // Hide all default headers
    cardStyle: {
      backgroundColor: colors.background,
    },
    animationEnabled: true,
    gestureEnabled: true,
  };

  if (isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="SendPayment" component={SendPaymentScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName="Login" 
      screenOptions={screenOptions}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default App;
