import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'expo-router';
import DashboardScreen from '@screens/DashboardScreen';
import { RootState } from '@store/index';

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return <DashboardScreen />;
}
