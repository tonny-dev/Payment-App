import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import PremiumHeader from '../components/PremiumHeader';
import { colors, typography, spacing, borderRadius } from '../theme';
import { RootState } from '../store/index';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const AnalyticsScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { transactions } = useSelector((state: RootState) => state.transactions);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data for analytics
  const getAnalyticsData = () => {
    if (user?.role === 'psp') {
      return {
        revenue: [
          { period: 'Jan', value: 12500 },
          { period: 'Feb', value: 15200 },
          { period: 'Mar', value: 18900 },
          { period: 'Apr', value: 22100 },
          { period: 'May', value: 19800 },
          { period: 'Jun', value: 25400 },
        ],
        merchants: [
          { status: 'Active', count: 15, color: colors.success },
          { status: 'Pending', count: 3, color: colors.warning },
          { status: 'Inactive', count: 2, color: colors.error },
        ],
        transactions: [
          { type: 'Successful', count: 1247, color: colors.success },
          { type: 'Failed', count: 23, color: colors.error },
          { type: 'Pending', count: 8, color: colors.warning },
        ],
      };
    } else {
      return {
        apiCalls: [
          { period: 'Mon', value: 45 },
          { period: 'Tue', value: 52 },
          { period: 'Wed', value: 38 },
          { period: 'Thu', value: 61 },
          { period: 'Fri', value: 48 },
          { period: 'Sat', value: 29 },
          { period: 'Sun', value: 35 },
        ],
        endpoints: [
          { name: '/transactions', calls: 156, color: colors.primary },
          { name: '/send', calls: 89, color: colors.secondary },
          { name: '/auth', calls: 67, color: colors.warning },
          { name: '/webhooks', calls: 34, color: colors.info },
        ],
        responseTime: [
          { range: '< 100ms', count: 234, color: colors.success },
          { range: '100-500ms', count: 89, color: colors.warning },
          { range: '> 500ms', count: 12, color: colors.error },
        ],
      };
    }
  };

  const data = getAnalyticsData();

  const SimpleBarChart = ({ data, title, valuePrefix = '' }: { 
    data: any[], 
    title: string, 
    valuePrefix?: string 
  }) => {
    const maxValue = Math.max(...data.map(item => item.value || item.calls || item.count));
    
    return (
      <PremiumCard style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.barChart}>
          {data.map((item, index) => {
            const height = ((item.value || item.calls || item.count) / maxValue) * 120;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: height || 10,
                        backgroundColor: item.color || colors.primary,
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>
                  {item.period || item.name?.split('/')[1] || item.range}
                </Text>
                <Text style={styles.barValue}>
                  {valuePrefix}{item.value || item.calls || item.count}
                </Text>
              </View>
            );
          })}
        </View>
      </PremiumCard>
    );
  };

  const DonutChart = ({ data, title }: { data: ChartData[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <PremiumCard style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.donutContainer}>
          <View style={styles.donutChart}>
            <View style={styles.donutCenter}>
              <Text style={styles.donutTotal}>{total}</Text>
              <Text style={styles.donutLabel}>Total</Text>
            </View>
          </View>
          <View style={styles.donutLegend}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
                <Text style={styles.legendValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </PremiumCard>
    );
  };

  const MetricCard = ({ title, value, change, icon, color }: {
    title: string;
    value: string;
    change: string;
    icon: string;
    color: string;
  }) => (
    <PremiumCard style={styles.metricCard} padding="md">
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={[styles.changeIndicator, { backgroundColor: `${colors.success}20` }]}>
          <Ionicons name="trending-up" size={12} color={colors.success} />
          <Text style={[styles.changeText, { color: colors.success }]}>{change}</Text>
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </PremiumCard>
  );

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'year'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive,
          ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <PremiumHeader 
        title="Analytics"
        subtitle={user?.role === 'psp' ? 'Business insights and metrics' : 'API usage and performance'}
        showBackButton={true}
        showNotifications={false}
        showProfile={false}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <PeriodSelector />

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {user?.role === 'psp' ? (
            <>
              <MetricCard
                title="Revenue"
                value="$25.4K"
                change="+12.5%"
                icon="trending-up"
                color={colors.success}
              />
              <MetricCard
                title="Merchants"
                value="15"
                change="+3"
                icon="business"
                color={colors.primary}
              />
              <MetricCard
                title="Success Rate"
                value="98.2%"
                change="+0.8%"
                icon="checkmark-circle"
                color={colors.secondary}
              />
              <MetricCard
                title="Avg. Transaction"
                value="$156"
                change="+5.2%"
                icon="card"
                color={colors.warning}
              />
            </>
          ) : (
            <>
              <MetricCard
                title="API Calls"
                value="1,247"
                change="+18.2%"
                icon="code-slash"
                color={colors.primary}
              />
              <MetricCard
                title="Success Rate"
                value="99.1%"
                change="+0.3%"
                icon="checkmark-circle"
                color={colors.success}
              />
              <MetricCard
                title="Avg. Response"
                value="89ms"
                change="-12ms"
                icon="flash"
                color={colors.warning}
              />
              <MetricCard
                title="Errors"
                value="12"
                change="-8"
                icon="alert-circle"
                color={colors.error}
              />
            </>
          )}
        </View>

        {/* Charts */}
        {user?.role === 'psp' ? (
          <>
            <SimpleBarChart 
              data={data.revenue} 
              title="Revenue Trend" 
              valuePrefix="$" 
            />
            <DonutChart 
              data={data.merchants.map(m => ({ label: m.status, value: m.count, color: m.color }))} 
              title="Merchant Status" 
            />
            <DonutChart 
              data={data.transactions.map(t => ({ label: t.type, value: t.count, color: t.color }))} 
              title="Transaction Status" 
            />
          </>
        ) : (
          <>
            <SimpleBarChart 
              data={data.apiCalls} 
              title="API Calls This Week" 
            />
            <SimpleBarChart 
              data={data.endpoints} 
              title="Top Endpoints" 
            />
            <DonutChart 
              data={data.responseTime.map(r => ({ label: r.range, value: r.count, color: r.color }))} 
              title="Response Time Distribution" 
            />
          </>
        )}

        {/* Export Options */}
        <PremiumCard style={styles.exportCard}>
          <Text style={styles.exportTitle}>Export Data</Text>
          <Text style={styles.exportDescription}>
            Download your analytics data in various formats
          </Text>
          <View style={styles.exportButtons}>
            <PremiumButton
              title="Export PDF"
              variant="outline"
              size="sm"
              icon={<Ionicons name="document-text" size={16} color={colors.primary} />}
              onPress={() => {}}
              style={styles.exportButton}
            />
            <PremiumButton
              title="Export CSV"
              variant="outline"
              size="sm"
              icon={<Ionicons name="grid" size={16} color={colors.primary} />}
              onPress={() => {}}
              style={styles.exportButton}
            />
          </View>
        </PremiumCard>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  metricCard: {
    width: (screenWidth - spacing.lg * 2 - spacing.sm) / 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  changeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs / 2,
  },
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metricTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  bar: {
    width: 20,
    borderRadius: borderRadius.sm,
    minHeight: 10,
  },
  barLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  barValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  donutCenter: {
    alignItems: 'center',
  },
  donutTotal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  donutLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  donutLegend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  legendValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  exportCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  exportTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  exportDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exportButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default AnalyticsScreen;
