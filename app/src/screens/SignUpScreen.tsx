import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  SegmentedButtons,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@_types/navigation';
import { useToast } from '@components/ToastProvider';
import { RootState } from '../store/index';
import {  signup, clearError } from '@store/authSlice';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'psp' | 'dev';
}

const SignUpScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoading, error, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const watchPassword = watch('password');

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
    const { confirmPassword, ...signupData } = data;
    dispatch(signup(signupData));
  };

  const roleOptions = [
    {
      value: 'dev',
      label: 'Developer',
      icon: 'code-tags',
    },
    {
      value: 'psp',
      label: 'PSP (Payment Service Provider)',
      icon: 'credit-card',
    },
  ];

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create Account</Title>

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
              <TextInput
                label="Email"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email?.message}
          </HelperText>

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  'Password must contain at least one uppercase letter, one lowercase letter, and one number',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.password}
                secureTextEntry={!showPassword}
                style={styles.input}
                right={
                <TextInput.Icon 
                  icon={showPassword ? 'eye-off' : 'eye'} 
                  onPress={() => setShowPassword(!showPassword)} 
                />
              }
              />
            )}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password?.message}
          </HelperText>

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: value =>
                value === watchPassword || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? 'eye-off' : 'eye'} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                />
              }
              />
            )}
          />
          <HelperText type="error" visible={!!errors.confirmPassword}>
            {errors.confirmPassword?.message}
          </HelperText>

          <Title style={styles.roleTitle}>Select Your Role</Title>

          <SegmentedButtons
            value={selectedRole}
            onValueChange={value => setSelectedRole(value as 'psp' | 'dev')}
            buttons={roleOptions}
            style={styles.segmentedButtons}
          />

          <HelperText
            type="info"
            visible={true}
            style={styles.roleDescription}>
            {selectedRole === 'dev'
              ? 'As a Developer, you can integrate with our payment APIs and access developer tools.'
              : 'As a PSP, you can manage merchant accounts and view transaction analytics.'}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}>
            Create Account
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}>
            Already have an account? Sign in
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  roleDescription: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 8,
  },
});

export default SignUpScreen;