import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import PremiumCard from '../components/PremiumCard';
import PremiumInput from '../components/PremiumInput';
import TransactionCard from '../components/TransactionCard';
import { useToast } from '../components/ToastProvider';
import { colors, typography, spacing, borderRadius } from '../theme';
import { RootState } from '../store/index';
import { Transaction } from '../types/index';

interface SearchFilter {
  type: 'all' | 'sent' | 'received';
  status: 'all' | 'completed' | 'pending' | 'failed';
  currency: 'all' | 'USD' | 'EUR' | 'GBP' | 'KES' | 'NGN';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  amountRange: {
    min: string;
    max: string;
  };
}

const SearchScreen: React.FC = () => {
  const { transactions } = useSelector((state: RootState) => state.transactions);
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'John Doe',
    'Payment to Alice',
    'USD 500',
    'Failed transactions',
  ]);

  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    status: 'all',
    currency: 'all',
    dateRange: 'all',
    amountRange: {
      min: '',
      max: '',
    },
  });

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, filters, transactions]);

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.recipient.toLowerCase().includes(query) ||
        transaction.currency.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction =>
        (transaction as any).type === filters.type
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction =>
        (transaction as any).status === filters.status
      );
    }

    // Currency filter
    if (filters.currency !== 'all') {
      filtered = filtered.filter(transaction =>
        transaction.currency === filters.currency
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(transaction =>
        new Date(transaction.timestamp) >= filterDate
      );
    }

    // Amount range filter
    if (filters.amountRange.min || filters.amountRange.max) {
      const min = parseFloat(filters.amountRange.min) || 0;
      const max = parseFloat(filters.amountRange.max) || Infinity;

      filtered = filtered.filter(transaction =>
        transaction.amount >= min && transaction.amount <= max
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      currency: 'all',
      dateRange: 'all',
      amountRange: {
        min: '',
        max: '',
      },
    });
    showToast('Filters cleared', 'success');
  };

  const FilterChip = ({
    label,
    active,
    onPress
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterChipText,
        active && styles.filterChipTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const QuickFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quickFiltersContainer}
      contentContainerStyle={styles.quickFiltersContent}
    >
      <FilterChip
        label="All"
        active={filters.type === 'all'}
        onPress={() => setFilters(prev => ({ ...prev, type: 'all' }))}
      />
      <FilterChip
        label="Sent"
        active={filters.type === 'sent'}
        onPress={() => setFilters(prev => ({ ...prev, type: 'sent' }))}
      />
      <FilterChip
        label="Received"
        active={filters.type === 'received'}
        onPress={() => setFilters(prev => ({ ...prev, type: 'received' }))}
      />
      <FilterChip
        label="Completed"
        active={filters.status === 'completed'}
        onPress={() => setFilters(prev => ({ ...prev, status: 'completed' }))}
      />
      <FilterChip
        label="Pending"
        active={filters.status === 'pending'}
        onPress={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
      />
      <FilterChip
        label="Failed"
        active={filters.status === 'failed'}
        onPress={() => setFilters(prev => ({ ...prev, status: 'failed' }))}
      />
    </ScrollView>
  );

  const AdvancedFilters = () => (
    <PremiumCard style={styles.filtersCard}>
      <View style={styles.filtersHeader}>
        <Text style={styles.filtersTitle}>Advanced Filters</Text>
        <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
          <Text style={styles.clearFiltersText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Currency Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Currency</Text>
        <View style={styles.filterOptions}>
          {['all', 'USD', 'EUR', 'GBP', 'KES', 'NGN'].map((currency) => (
            <FilterChip
              key={currency}
              label={currency.toUpperCase()}
              active={filters.currency === currency}
              onPress={() => setFilters(prev => ({ ...prev, currency: currency as any }))}
            />
          ))}
        </View>
      </View>

      {/* Date Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Date Range</Text>
        <View style={styles.filterOptions}>
          {[
            { key: 'all', label: 'All Time' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'year', label: 'This Year' },
          ].map((option) => (
            <FilterChip
              key={option.key}
              label={option.label}
              active={filters.dateRange === option.key}
              onPress={() => setFilters(prev => ({ ...prev, dateRange: option.key as any }))}
            />
          ))}
        </View>
      </View>

      {/* Amount Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Amount Range</Text>
        <View style={styles.amountRangeInputs}>
          <PremiumInput
            placeholder="Min amount"
            value={filters.amountRange.min}
            onChangeText={(value) =>
              setFilters(prev => ({
                ...prev,
                amountRange: { ...prev.amountRange, min: value }
              }))
            }
            keyboardType="decimal-pad"
            style={styles.amountInput}
            size="sm"
          />
          <Text style={styles.amountRangeSeparator}>to</Text>
          <PremiumInput
            placeholder="Max amount"
            value={filters.amountRange.max}
            onChangeText={(value) =>
              setFilters(prev => ({
                ...prev,
                amountRange: { ...prev.amountRange, max: value }
              }))
            }
            keyboardType="decimal-pad"
            style={styles.amountInput}
            size="sm"
          />
        </View>
      </View>
    </PremiumCard>
  );

  const RecentSearches = () => (
    <PremiumCard style={styles.recentSearchesCard}>
      <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
      {recentSearches.map((search, index) => (
        <TouchableOpacity
          key={index}
          style={styles.recentSearchItem}
          onPress={() => handleSearch(search)}
          activeOpacity={0.7}
        >
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.recentSearchText}>{search}</Text>
          <TouchableOpacity
            onPress={() => setRecentSearches(prev => prev.filter((_, i) => i !== index))}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </PremiumCard>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => showToast('Transaction details coming soon!', 'info')}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find transactions and data</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <PremiumInput
          placeholder="Search transactions, recipients, amounts..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon="search"
          rightIcon={searchQuery ? "close" : undefined}
          onRightIconPress={() => setSearchQuery('')}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options"
            size={20}
            color={showFilters ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      <QuickFilters />

      {/* Advanced Filters */}
      {showFilters && <AdvancedFilters />}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {searchQuery.trim() === '' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <RecentSearches />
          </ScrollView>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
              </Text>
              {filteredTransactions.length > 0 && (
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.sortText}>Sort by date</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTransaction}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={() => (
                <PremiumCard style={styles.emptyState}>
                  <Ionicons name="search" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyStateTitle}>No results found</Text>
                  <Text style={styles.emptyStateDescription}>
                    Try adjusting your search terms or filters
                  </Text>
                </PremiumCard>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  filterToggle: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
  },
  quickFiltersContainer: {
    marginBottom: spacing.md,
  },
  quickFiltersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    height: 40,
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filtersCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filtersTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  clearFiltersText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amountRangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  amountInput: {
    flex: 1,
  },
  amountRangeSeparator: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  recentSearchesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  recentSearchesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentSearchText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  resultsContainer: {
    flex: 1,
    paddingTop: spacing.sm,
    justifyContent: 'flex-start',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  resultsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  sortText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  resultsList: {
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginTop: spacing.xl,
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
  },
});

export default SearchScreen;
