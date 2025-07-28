import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface Transaction {
  id: string;
  recipient: string;
  amount: number;
  currency: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'failed';
  type?: 'sent' | 'received';
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const { recipient, amount, currency, timestamp, status = 'completed', type = 'sent' } = transaction;

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = () => {
    return type === 'sent' ? 'arrow-up-circle' : 'arrow-down-circle';
  };

  const getTypeColor = () => {
    return type === 'sent' ? colors.error : colors.success;
  };

  const formatAmount = () => {
    const sign = type === 'sent' ? '-' : '+';
    return `${sign}${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = () => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getTypeIcon() as keyof typeof Ionicons.glyphMap}
          size={24}
          color={getTypeColor()}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.recipient} numberOfLines={1}>
            {type === 'sent' ? `To ${recipient}` : `From ${recipient}`}
          </Text>
          <Text style={[styles.amount, { color: getTypeColor() }]}>
            {formatAmount()}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {formatDate()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recipient: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  amount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
});

export default TransactionCard;
