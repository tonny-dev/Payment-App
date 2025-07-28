import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useToast } from '../components/ToastProvider';
import { RootState, AppDispatch } from '../store/index';
import { signup, clearError } from '../store/authSlice';
import GradientBackground from '../components/GradientBackground';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import { colors, typography, spacing, borderRadius } from '../theme';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'psp' | 'dev';
}

const SignUpScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoading, error, user } = useSelector((state: RootState) => state.auth);
  const [selectedRole, setSelectedRole] = useState<'psp' | 'dev'>('dev');

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'dev',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (user) {
      navigation.navigate('Dashboard');
    }
  }, [user, navigation]);

  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  useEffect(() => {
    setValue('role', selectedRole);
  }, [selectedRole, setValue]);

  const onSubmit = (data: SignUpFormData) => {
    dispatch(signup({
      email: data.email,
      password: data.password,
      role: data.role,
    }));
  };

  const RoleSelector = () => (
    <View style={styles.roleSelector}>
      <Text style={styles.roleSelectorLabel}>Account Type</Text>
      <View style={styles.roleOptions}>
        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === 'dev' && styles.roleOptionSelected,
          ]}
          onPress={() => setSelectedRole('dev')}
          activeOpacity={0.7}
        >
          <View style={styles.roleIconContainer}>
            <Ionicons
              name="code-slash"
              size={24}
              color={selectedRole === 'dev' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text style={[
            styles.roleOptionTitle,
            selectedRole === 'dev' && styles.roleOptionTitleSelected,
          ]}>
            Developer
          </Text>
          <Text style={styles.roleOptionDescription}>
            Build and integrate payment solutions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === 'psp' && styles.roleOptionSelected,
          ]}
          onPress={() => setSelectedRole('psp')}
          activeOpacity={0.7}
        >
          <View style={styles.roleIconContainer}>
            <Ionicons
              name="business"
              size={24}
              color={selectedRole === 'psp' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text style={[
            styles.roleOptionTitle,
            selectedRole === 'psp' && styles.roleOptionTitleSelected,
          ]}>
            PSP
          </Text>
          <Text style={styles.roleOptionDescription}>
            Manage payment service provider operations
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join thousands of developers and PSPs
              </Text>
            </View>

            {/* Signup Form */}
            <PremiumCard style={styles.card} elevation="lg">
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
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    leftIcon="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <PremiumInput
                    label="Password"
                    placeholder="Create a password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    leftIcon="lock-closed"
                    secureTextEntry
                    autoComplete="new-password"
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <PremiumInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    leftIcon="lock-closed"
                    secureTextEntry
                    autoComplete="new-password"
                  />
                )}
              />

              <RoleSelector />

              <PremiumButton
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.signupButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <PremiumButton
                title="Sign In Instead"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                fullWidth
                size="lg"
              />
            </PremiumCard>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    marginBottom: spacing.xl,
  },
  roleSelector: {
    marginBottom: spacing.lg,
  },
  roleSelectorLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  roleOptionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  roleOptionTitleSelected: {
    color: colors.primary,
  },
  roleOptionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  signupButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

export default SignUpScreen;
