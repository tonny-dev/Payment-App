import { DefaultTheme } from 'react-native-paper';

export const darkColors = {
  // Primary brand colors
  primary: '#818CF8', // Lighter indigo for dark mode
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  
  // Secondary colors
  secondary: '#34D399', // Lighter emerald
  secondaryLight: '#6EE7B7',
  secondaryDark: '#10B981',
  
  // Accent colors
  accent: '#FBBF24', // Lighter amber
  accentLight: '#FCD34D',
  accentDark: '#F59E0B',
  
  // Status colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Neutral colors (inverted for dark mode)
  white: '#000000',
  black: '#FFFFFF',
  gray50: '#1F2937',
  gray100: '#374151',
  gray200: '#4B5563',
  gray300: '#6B7280',
  gray400: '#9CA3AF',
  gray500: '#D1D5DB',
  gray600: '#E5E7EB',
  gray700: '#F3F4F6',
  gray800: '#F9FAFB',
  gray900: '#FFFFFF',
  
  // Background colors
  background: '#111827',
  surface: '#1F2937',
  surfaceVariant: '#374151',
  
  // Text colors
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#111827',
  
  // Border colors
  border: '#374151',
  borderLight: '#4B5563',
  borderDark: '#1F2937',
  
  // Gradient colors
  gradientStart: '#818CF8',
  gradientEnd: '#A78BFA',
  
  // Card shadows (adjusted for dark mode)
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
};

export const darkPaperTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: darkColors.primary,
    accent: darkColors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    text: darkColors.textPrimary,
    placeholder: darkColors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.7)',
    onSurface: darkColors.textPrimary,
    notification: darkColors.error,
  },
  roundness: 8,
};
