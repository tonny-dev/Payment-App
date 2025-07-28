import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'expo-router';
import LoginScreen from '@screens/LoginScreen';
import { RootState } from '@store/index';

export default function Index() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  return <LoginScreen />;
}
