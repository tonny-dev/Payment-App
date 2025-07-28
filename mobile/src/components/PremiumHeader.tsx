import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { RootState } from '../store/index';

interface PremiumHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  showSearch?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  backgroundColor?: string;
  variant?: 'default' | 'gradient' | 'transparent';
}

const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showNotifications = true,
  showProfile = true,
  showSearch = false,
  rightComponent,
  onBackPress,
  backgroundColor = colors.primary,
  variant = 'gradient',
}) => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleSection}>
          {title ? (
            <>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </>
          ) : (
            <>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightComponent || (
          <>
            {showSearch && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Search' as never)}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={22} color={colors.white} />
              </TouchableOpacity>
            )}

            {showNotifications && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Notifications' as never)}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.white} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            )}

            {showProfile && (
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile' as never)}
                activeOpacity={0.7}
              >
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <HeaderContent />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (variant === 'transparent') {
    return (
      <SafeAreaView style={[styles.container, styles.transparentContainer]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.transparentHeader}>
          <HeaderContent />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={[styles.defaultHeader, { backgroundColor }]}>
        <HeaderContent />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  gradientHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  defaultHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  transparentHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    backdropFilter: 'blur(10px)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs / 2,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textTransform: 'capitalize',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  profileButton: {
    marginLeft: spacing.xs,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileAvatarText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

export default PremiumHeader;
