import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Snackbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@_types/navigation';
import { useToast } from '@components/ToastProvider';
import { fetchTransactions } from '@store/transactionSlice';
import { logout } from '@store/authSlice';
import { RootState } from '@store/index';
import { Transaction } from '@types/transactionSlice';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { transactions, isLoading } = useSelector(
    (state: RootState) => state.transactions
  );

  const [showToastShown, setShowToastShown] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  // Show role-based toast notification once
  useEffect(() => {
    if (user && !showToastShown) {
      const message =
        user.role === 'psp'
          ? 'You have 15 merchants connected'
          : "You've made 42 API calls this week";

      showToast(`Welcome back! ${message}`, 'info');
      setShowToastShown(true);
    }
  }, [user, showToastShown, showToast]);

  const handleRefresh = () => {
    dispatch(fetchTransactions());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.navigate('Login');
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <Title style={styles.recipient}>{item.recipient}</Title>
        <Paragraph style={styles.amount}>
          {item.currency} {item.amount.toFixed(2)}
        </Paragraph>
        <Paragraph style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()} at{' '}
          {new Date(item.timestamp).toLocaleTimeString()}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title>Welcome, {user?.email}</Title>
          <Paragraph>Role: {user?.role?.toUpperCase()}</Paragraph>
          <Button
            mode='outlined'
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      <Title style={styles.sectionTitle}>Recent Transactions</Title>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon='plus'
        onPress={() => navigation.navigate('SendPayment')}
        label='Send Payment'
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 80,
  },
  transactionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  recipient: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    color: '#4CAF50',
    marginVertical: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});

export default DashboardScreen;
