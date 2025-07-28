import { router } from 'expo-router';

// Navigation helper functions for Expo Router
export const navigate = {
  toLogin: () => router.push('/'),
  toSignup: () => router.push('/signup'),
  toDashboard: () => router.push('/dashboard'),
  toSendPayment: () => router.push('/send-payment'),
  back: () => router.back(),
  replace: (href: string) => router.replace(href as any),
};

// Legacy navigation adapter (for gradual migration)
export const createLegacyNavigation = () => ({
  navigate: (screen: string) => {
    switch (screen) {
      case 'Login':
        return navigate.toLogin();
      case 'Signup':
        return navigate.toSignup();
      case 'Dashboard':
        return navigate.toDashboard();
      case 'SendPayment':
        return navigate.toSendPayment();
      default:
        console.warn(`Unknown screen: ${screen}`);
    }
  },
  goBack: () => navigate.back(),
  replace: (screen: string) => {
    switch (screen) {
      case 'Login':
        return router.replace('/');
      case 'Dashboard':
        return router.replace('/dashboard');
      default:
        console.warn(`Unknown screen for replace: ${screen}`);
    }
  },
});
