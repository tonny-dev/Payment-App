import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'expo-router';
import SendPaymentScreen from '@screens/SendPaymentScreen';
import { RootState } from '@store/index';

export default function SendPayment() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return <SendPaymentScreen />;
}
