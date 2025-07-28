import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import { useToast } from '../components/ToastProvider';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { RootState } from '../store/index';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  bio: string;
}

const ProfileScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      company: user?.role === 'psp' ? 'PayTech Solutions' : 'DevCorp Inc.',
      website: 'https://example.com',
      bio: user?.role === 'psp' 
        ? 'Payment service provider focused on seamless transactions and merchant success.'
        : 'Full-stack developer passionate about fintech and payment solutions.',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    }, 1000);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const TabButton = ({ 
    title, 
    value, 
    icon 
  }: { 
    title: string; 
    value: typeof activeTab; 
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === value && styles.tabButtonActive,
      ]}
      onPress={() => setActiveTab(value)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === value ? colors.primary : colors.textSecondary}
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === value && styles.tabButtonTextActive,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: string; 
    icon: string; 
    color: string;
  }) => (
    <PremiumCard style={styles.statCard} padding="md">
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </PremiumCard>
  );

  const ProfileTab = () => (
    <View>
      {/* Profile Header */}
      <PremiumCard style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarEditButton} activeOpacity={0.7}>
            <Ionicons name="camera" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.profileBadge}>
            <Ionicons 
              name={user?.role === 'psp' ? 'business' : 'code-slash'} 
              size={12} 
              color={colors.primary} 
            />
            <Text style={styles.profileBadgeText}>
              {user?.role === 'psp' ? 'PSP Account' : 'Developer'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isEditing ? "close" : "pencil"} 
            size={16} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </PremiumCard>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {user?.role === 'psp' ? (
          <>
            <StatCard
              title="Merchants"
              value="15"
              icon="business"
              color={colors.primary}
            />
            <StatCard
              title="Volume"
              value="$24.5K"
              icon="trending-up"
              color={colors.success}
            />
            <StatCard
              title="Success Rate"
              value="98.2%"
              icon="checkmark-circle"
              color={colors.secondary}
            />
          </>
        ) : (
          <>
            <StatCard
              title="API Calls"
              value="1,247"
              icon="code-slash"
              color={colors.primary}
            />
            <StatCard
              title="Projects"
              value="8"
              icon="folder"
              color={colors.warning}
            />
            <StatCard
              title="Success Rate"
              value="99.1%"
              icon="checkmark-circle"
              color={colors.success}
            />
          </>
        )}
      </View>

      {/* Profile Form */}
      <PremiumCard style={styles.formCard}>
        <Text style={styles.formTitle}>
          {isEditing ? 'Edit Profile' : 'Profile Information'}
        </Text>

        <View style={styles.formRow}>
          <Controller
            control={control}
            name="firstName"
            rules={{ required: 'First name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PremiumInput
                label="First Name"
                placeholder="Enter first name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                editable={isEditing}
                style={styles.halfInput}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            rules={{ required: 'Last name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PremiumInput
                label="Last Name"
                placeholder="Enter last name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                editable={isEditing}
                style={styles.halfInput}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email format',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PremiumInput
              label="Email"
              placeholder="Enter email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              leftIcon="mail"
              editable={isEditing}
              keyboardType="email-address"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <PremiumInput
              label="Phone"
              placeholder="Enter phone number"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              leftIcon="call"
              editable={isEditing}
              keyboardType="phone-pad"
            />
          )}
        />

        <Controller
          control={control}
          name="company"
          render={({ field: { onChange, onBlur, value } }) => (
            <PremiumInput
              label="Company"
              placeholder="Enter company name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              leftIcon="business"
              editable={isEditing}
            />
          )}
        />

        <Controller
          control={control}
          name="website"
          render={({ field: { onChange, onBlur, value } }) => (
            <PremiumInput
              label="Website"
              placeholder="Enter website URL"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              leftIcon="globe"
              editable={isEditing}
              keyboardType="url"
            />
          )}
        />

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <PremiumInput
              label="Bio"
              placeholder="Tell us about yourself"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              leftIcon="person"
              editable={isEditing}
              multiline
              numberOfLines={3}
            />
          )}
        />

        {isEditing && (
          <View style={styles.formActions}>
            <PremiumButton
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              style={styles.actionButton}
            />
            <PremiumButton
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              style={styles.actionButton}
            />
          </View>
        )}
      </PremiumCard>
    </View>
  );

  const SecurityTab = () => (
    <View>
      <PremiumCard style={styles.securityCard}>
        <Text style={styles.formTitle}>Security Settings</Text>
        
        <TouchableOpacity style={styles.securityItem} activeOpacity={0.7}>
          <View style={styles.securityLeft}>
            <View style={[styles.securityIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="key" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.securityTitle}>Change Password</Text>
              <Text style={styles.securityDescription}>Update your password</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.securityItem} activeOpacity={0.7}>
          <View style={styles.securityLeft}>
            <View style={[styles.securityIcon, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="finger-print" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.securityTitle}>Biometric Authentication</Text>
              <Text style={styles.securityDescription}>Use fingerprint or face ID</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.securityItem} activeOpacity={0.7}>
          <View style={styles.securityLeft}>
            <View style={[styles.securityIcon, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.securityTitle}>Two-Factor Authentication</Text>
              <Text style={styles.securityDescription}>Add extra security layer</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </PremiumCard>

      <PremiumCard style={styles.securityCard}>
        <Text style={styles.formTitle}>Login Activity</Text>
        <View style={styles.activityItem}>
          <View style={styles.activityLeft}>
            <Ionicons name="phone-portrait" size={20} color={colors.success} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>iPhone 14 Pro</Text>
              <Text style={styles.activityDescription}>Current session • New York</Text>
            </View>
          </View>
          <Text style={styles.activityTime}>Now</Text>
        </View>
        
        <View style={styles.activityItem}>
          <View style={styles.activityLeft}>
            <Ionicons name="desktop" size={20} color={colors.textSecondary} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>MacBook Pro</Text>
              <Text style={styles.activityDescription}>Web browser • San Francisco</Text>
            </View>
          </View>
          <Text style={styles.activityTime}>2h ago</Text>
        </View>
      </PremiumCard>
    </View>
  );

  const PreferencesTab = () => (
    <View>
      <PremiumCard style={styles.preferencesCard}>
        <Text style={styles.formTitle}>App Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Language</Text>
          <TouchableOpacity style={styles.preferenceValue} activeOpacity={0.7}>
            <Text style={styles.preferenceValueText}>English</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Currency</Text>
          <TouchableOpacity style={styles.preferenceValue} activeOpacity={0.7}>
            <Text style={styles.preferenceValueText}>USD ($)</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Time Zone</Text>
          <TouchableOpacity style={styles.preferenceValue} activeOpacity={0.7}>
            <Text style={styles.preferenceValueText}>EST (UTC-5)</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </PremiumCard>

      <PremiumCard style={styles.preferencesCard}>
        <Text style={styles.formTitle}>Data & Privacy</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Data Export</Text>
          <PremiumButton
            title="Download"
            variant="outline"
            size="sm"
            onPress={() => showToast('Preparing data export...', 'info')}
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Account Deletion</Text>
          <PremiumButton
            title="Request"
            variant="outline"
            size="sm"
            onPress={() => showToast('Account deletion requested', 'warning')}
          />
        </View>
      </PremiumCard>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton title="Profile" value="profile" icon="person" />
        <TabButton title="Security" value="security" icon="shield-checkmark" />
        <TabButton title="Preferences" value="preferences" icon="settings" />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    marginHorizontal: spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: `${colors.primary}20`,
  },
  tabButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.primary}20`,
    borderRadius: borderRadius.sm,
  },
  profileBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  editButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
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
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  securityCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  securityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  securityDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityInfo: {
    marginLeft: spacing.md,
  },
  activityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  activityDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  activityTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  preferencesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  preferenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceValueText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default ProfileScreen;
