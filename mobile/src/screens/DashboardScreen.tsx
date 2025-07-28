import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useToast } from '../components/ToastProvider';
import { fetchTransactions } from '../store/transactionSlice';
import { logout } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/index';
import { Transaction } from '../types/index';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import PremiumHeader from '../components/PremiumHeader';
import TransactionCard from '../components/TransactionCard';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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

      showToast(`Welcome back! ${message}`, 'success');
      setShowToastShown(true);
    }
  }, [user, showToastShown, showToast]);

  const handleRefresh = () => {
    dispatch(fetchTransactions());
  };

  const getStatsForRole = () => {
    if (user?.role === 'psp') {
      return [
        { label: 'Merchants', value: '15', icon: 'business', color: colors.primary },
        { label: 'Volume', value: '$24.5K', icon: 'trending-up', color: colors.success },
        { label: 'Success Rate', value: '98.2%', icon: 'checkmark-circle', color: colors.secondary },
      ];
    } else {
      return [
        { label: 'API Calls', value: '42', icon: 'code-slash', color: colors.primary },
        { label: 'This Week', value: '156', icon: 'calendar', color: colors.warning },
        { label: 'Success Rate', value: '99.1%', icon: 'checkmark-circle', color: colors.success },
      ];
    }
  };

  const StatCard = ({ stat }: { stat: any }) => (
    <PremiumCard style={styles.statCard} padding="md">
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
          <Ionicons name={stat.icon} size={24} color={stat.color} />
        </View>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </View>
    </PremiumCard>
  );

  const QuickActions = () => (
    <PremiumCard style={styles.quickActionsCard}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('SendPayment')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="send" size={20} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Send Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => handleRefresh()}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.secondary}20` }]}>
            <Ionicons name="refresh" size={20} color={colors.secondary} />
          </View>
          <Text style={styles.quickActionText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Analytics')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.warning}20` }]}>
            <Ionicons name="analytics" size={20} color={colors.warning} />
          </View>
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.info}20` }]}>
            <Ionicons name="settings" size={20} color={colors.info} />
          </View>
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </PremiumCard>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => {
        showToast('Transaction details coming soon!', 'info');
      }}
    />
  );

  return (
    <View style={styles.container}>
      <PremiumHeader 
        showSearch={true}
        showNotifications={true}
        showProfile={true}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          {getStatsForRole().map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </View>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Transactions */}
        <PremiumCard style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No transactions yet</Text>
              <Text style={styles.emptyStateDescription}>
                Your recent transactions will appear here
              </Text>
              <PremiumButton
                title="Send Your First Payment"
                onPress={() => navigation.navigate('SendPayment')}
                variant="outline"
                size="sm"
                style={styles.emptyStateButton}
              />
            </View>
          ) : (
            <FlatList
              data={transactions.slice(0, 5)} // Show only recent 5
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTransaction}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </PremiumCard>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SendPayment')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActionsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  transactionsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    marginTop: spacing.sm,
  },
  bottomSpacing: {
    height: 100, // Space for FAB
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});

export default DashboardScreen;
