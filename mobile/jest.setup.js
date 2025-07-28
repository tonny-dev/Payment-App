import 'react-native-gesture-handler/jests-setup';

// Mock the store and persistor
jest.mock('./src/store', () => ({
  store: {
    getState: () => ({ 
      auth: { 
        user: null, 
        isLoading: false, 
        error: null 
      } 
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
  persistor: {
    flush: jest.fn(),
    pause: jest.fn(),
    persist: jest.fn(),
    purge: jest.fn(),
    register: jest.fn(),
  },
  RootState: {},
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  return {
    ...RealModule,
    Portal: ({ children }) => children,
  };
});

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock PersistGate
jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }) => children,
}));

// Silence warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');