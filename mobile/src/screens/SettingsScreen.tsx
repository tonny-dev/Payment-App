import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import { useToast } from '../components/ToastProvider';
import { logout } from '../store/authSlice';
import { colors, typography, spacing, borderRadius } from '../theme';
import { RootState, AppDispatch } from '../store/index';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  // Settings state
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    biometricAuth: false,
    autoBackup: true,
    analytics: true,
    marketing: false,
    twoFactor: false,
    offlineMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    if (key === 'darkMode') {
      showToast(
        `Dark mode ${!settings[key] ? 'enabled' : 'disabled'}`,
        'success'
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            showToast('Signed out successfully', 'success');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            showToast('Account deletion requested', 'warning');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onToggle, 
    type = 'switch',
    onPress,
    showChevron = false,
    color = colors.textPrimary,
  }: {
    icon: string;
    title: string;
    description?: string;
    value?: boolean;
    onToggle?: () => void;
    type?: 'switch' | 'button';
    onPress?: () => void;
    showChevron?: boolean;
    color?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={type === 'button' ? 0.7 : 1}
      disabled={type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color }]}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: colors.gray300, true: `${colors.primary}40` }}
            thumbColor={value ? colors.primary : colors.gray400}
          />
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        {/* Profile Section */}
        <PremiumCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.email?.split('@')[0]}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>
                  {user?.role === 'psp' ? 'PSP Account' : 'Developer'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </PremiumCard>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <PremiumCard style={styles.settingsCard}>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            description="Switch to dark theme"
            value={settings.darkMode}
            onToggle={() => toggleSetting('darkMode')}
          />
        </PremiumCard>

        {/* Security */}
        <SectionHeader title="Security" />
        <PremiumCard style={styles.settingsCard}>
          <SettingItem
            icon="finger-print"
            title="Biometric Authentication"
            description="Use fingerprint or face ID"
            value={settings.biometricAuth}
            onToggle={() => toggleSetting('biometricAuth')}
          />
          <SettingItem
            icon="shield-checkmark"
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            value={settings.twoFactor}
            onToggle={() => toggleSetting('twoFactor')}
          />
          <SettingItem
            icon="key"
            title="Change Password"
            type="button"
            onPress={() => showToast('Password change coming soon', 'info')}
            showChevron
          />
        </PremiumCard>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <PremiumCard style={styles.settingsCard}>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            description="Receive transaction alerts"
            value={settings.notifications}
            onToggle={() => toggleSetting('notifications')}
          />
          <SettingItem
            icon="mail"
            title="Email Notifications"
            description="Get updates via email"
            value={settings.marketing}
            onToggle={() => toggleSetting('marketing')}
          />
        </PremiumCard>

        {/* Data & Privacy */}
        <SectionHeader title="Data & Privacy" />
        <PremiumCard style={styles.settingsCard}>
          <SettingItem
            icon="cloud-upload"
            title="Auto Backup"
            description="Backup data to cloud"
            value={settings.autoBackup}
            onToggle={() => toggleSetting('autoBackup')}
          />
          <SettingItem
            icon="analytics"
            title="Analytics"
            description="Help improve the app"
            value={settings.analytics}
            onToggle={() => toggleSetting('analytics')}
          />
          <SettingItem
            icon="cloud-offline"
            title="Offline Mode"
            description="Access data without internet"
            value={settings.offlineMode}
            onToggle={() => toggleSetting('offlineMode')}
          />
        </PremiumCard>

        {/* Support */}
        <SectionHeader title="Support" />
        <PremiumCard style={styles.settingsCard}>
          <SettingItem
            icon="help-circle"
            title="Help Center"
            type="button"
            onPress={() => showToast('Opening help center...', 'info')}
            showChevron
          />
          <SettingItem
            icon="chatbubble"
            title="Contact Support"
            type="button"
            onPress={() => showToast('Starting chat with support...', 'info')}
            showChevron
          />
          <SettingItem
            icon="star"
            title="Rate App"
            type="button"
            onPress={() => showToast('Thank you for your feedback!', 'success')}
            showChevron
          />
        </PremiumCard>

        {/* About */}
        <SectionHeader title="About" />
        <PremiumCard style={styles.settingsCard}>
          <SettingItem
            icon="information-circle"
            title="App Version"
            description="1.0.0 (Build 1)"
            type="button"
            showChevron
          />
          <SettingItem
            icon="document-text"
            title="Terms of Service"
            type="button"
            onPress={() => showToast('Opening terms...', 'info')}
            showChevron
          />
          <SettingItem
            icon="shield"
            title="Privacy Policy"
            type="button"
            onPress={() => showToast('Opening privacy policy...', 'info')}
            showChevron
          />
        </PremiumCard>

        {/* Account Actions */}
        <SectionHeader title="Account" />
        <PremiumCard style={styles.settingsCard}>
          <SettingItem
            icon="log-out"
            title="Sign Out"
            type="button"
            onPress={handleLogout}
            color={colors.warning}
          />
          <SettingItem
            icon="trash"
            title="Delete Account"
            description="Permanently delete your account"
            type="button"
            onPress={handleDeleteAccount}
            color={colors.error}
          />
        </PremiumCard>

        {/* Premium Features */}
        <PremiumCard style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <Ionicons name="diamond" size={32} color={colors.warning} />
            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
            <Text style={styles.premiumDescription}>
              Unlock advanced analytics, priority support, and exclusive features
            </Text>
          </View>
          <View style={styles.premiumFeatures}>
            <View style={styles.premiumFeature}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.premiumFeatureText}>Advanced Analytics</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.premiumFeatureText}>Priority Support</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.premiumFeatureText}>Custom Branding</Text>
            </View>
          </View>
          <PremiumButton
            title="Upgrade Now"
            onPress={() => showToast('Premium upgrade coming soon!', 'info')}
            size="sm"
            style={styles.premiumButton}
          />
        </PremiumCard>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInitial: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  profileBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: `${colors.primary}20`,
    borderRadius: borderRadius.sm,
  },
  profileBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  editButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: `${colors.warning}10`,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  premiumTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  premiumDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  premiumFeatures: {
    marginBottom: spacing.md,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  premiumFeatureText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  premiumButton: {
    alignSelf: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default SettingsScreen;
