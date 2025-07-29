import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import { useToast } from '../components/ToastProvider';
import { colors, typography, spacing, borderRadius } from '../theme';
import { RootState } from '../store/index';

interface Notification {
  id: string;
  type: 'payment' | 'security' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const NotificationsScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'security'>('all');

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received $250.00 from John Doe',
      timestamp: '2024-01-28T10:30:00Z',
      read: false,
      priority: 'high',
    },
    {
      id: '2',
      type: 'security',
      title: 'New Login Detected',
      message: 'Someone signed in from a new device in New York',
      timestamp: '2024-01-28T09:15:00Z',
      read: false,
      priority: 'high',
    },
    {
      id: '3',
      type: 'system',
      title: 'Maintenance Complete',
      message: 'System maintenance has been completed successfully',
      timestamp: '2024-01-28T08:00:00Z',
      read: true,
      priority: 'medium',
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Failed',
      message: 'Payment to Alice Smith failed due to insufficient funds',
      timestamp: '2024-01-27T16:45:00Z',
      read: true,
      priority: 'high',
    },
    {
      id: '5',
      type: 'promotion',
      title: 'New Feature Available',
      message: 'Check out our new analytics dashboard with advanced insights',
      timestamp: '2024-01-27T14:20:00Z',
      read: true,
      priority: 'low',
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return 'card';
      case 'security':
        return 'shield-checkmark';
      case 'system':
        return 'settings';
      case 'promotion':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment':
        return colors.success;
      case 'security':
        return colors.error;
      case 'system':
        return colors.info;
      case 'promotion':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
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
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    showToast('All notifications marked as read', 'success');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    showToast('Notification deleted', 'success');
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'payment':
        return notif.type === 'payment';
      case 'security':
        return notif.type === 'security';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const FilterButton = ({
    title,
    value,
    count
  }: {
    title: string;
    value: typeof filter;
    count?: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterButtonText,
        filter === value && styles.filterButtonTextActive,
      ]}>
        {title}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const NotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.notificationItemUnread,
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationLeft}>
        <View style={[
          styles.notificationIcon,
          { backgroundColor: `${getNotificationColor(item.type)}20` }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              !item.read && styles.notificationTitleUnread,
            ]}>
              {item.title}
            </Text>
            <View style={styles.notificationMeta}>
              <View style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(item.priority) }
              ]} />
              <Text style={styles.notificationTime}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color={colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <PremiumButton
          title="Mark All Read"
          variant="outline"
          size="sm"
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
          style={styles.actionButton}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterButton title="All" value="all" />
        <FilterButton title="Unread" value="unread" count={unreadCount} />
        <FilterButton title="Payments" value="payment" />
        <FilterButton title="Security" value="security" />
      </ScrollView>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <PremiumCard style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateDescription}>
              {filter === 'all'
                ? "You're all caught up! New notifications will appear here."
                : `No ${filter} notifications found.`
              }
            </Text>
          </PremiumCard>
        )}
      />

      {/* Notification Settings */}
      <PremiumCard style={styles.settingsCard}>
        <View style={styles.settingsHeader}>
          <Ionicons name="settings" size={20} color={colors.primary} />
          <Text style={styles.settingsTitle}>Notification Settings</Text>
        </View>
        <Text style={styles.settingsDescription}>
          Customize when and how you receive notifications
        </Text>
        <PremiumButton
          title="Manage Settings"
          variant="outline"
          size="sm"
          onPress={() => showToast('Opening notification settings...', 'info')}
          style={styles.settingsButton}
        />
      </PremiumCard>
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
  actions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  actionButton: {
    alignSelf: 'flex-end',
  },
  filtersContainer: {
    marginBottom: spacing.md,
    // height: 40,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    height: 40,
    width: 'auto',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error,
    minWidth: 18,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  notificationsList: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    paddingTop: 0,
  },
  notificationsContent: {
    paddingHorizontal: spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  notificationItemUnread: {
    backgroundColor: `${colors.primary}05`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationTitleUnread: {
    fontWeight: typography.fontWeight.semibold,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  notificationTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
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
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settingsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  settingsDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  settingsButton: {
    alignSelf: 'flex-start',
  },
});

export default NotificationsScreen;
