import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import { clearError } from '../store/authSlice';

const ReduxTest: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  const { transactions } = useSelector((state: RootState) => state.transactions);

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redux State Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auth State:</Text>
        <Text>User: {user ? JSON.stringify(user) : 'null'}</Text>
        <Text>Loading: {isLoading.toString()}</Text>
        <Text>Error: {error || 'null'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transactions State:</Text>
        <Text>Count: {transactions.length}</Text>
      </View>

      <Button mode="contained" onPress={handleClearError} style={styles.button}>
        Clear Error (Test Action)
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default ReduxTest;
