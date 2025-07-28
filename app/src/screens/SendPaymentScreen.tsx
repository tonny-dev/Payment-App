import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../components/ToastProvider';
import { sendPayment, clearError } from '../store/transactionSlice';
import { RootState, AppDispatch } from '../store/index';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import PremiumHeader from '../components/PremiumHeader';
import { colors, typography, spacing, borderRadius } from '../theme';

interface PaymentFormData {
  recipient: string;
  amount: string;
  currency: string;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
];

const SendPaymentScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.transactions,
  );
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PaymentFormData>({
    defaultValues: {
      recipient: '',
      amount: '',
      currency: 'USD',
    },
  });

  const { showToast } = useToast();
  const amount = watch('amount');

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const result = await dispatch(
        sendPayment({
          recipient: data.recipient,
          amount: parseFloat(data.amount),
          currency: data.currency,
        }),
      ).unwrap();

      showToast('Payment sent successfully!', 'success');
      reset();
      navigation.goBack();
    } catch (error) {
      // Error is handled by the useEffect above
    }
  };

  const CurrencyPicker = () => (
    <PremiumCard style={styles.currencyPicker}>
      <Text style={styles.currencyPickerTitle}>Select Currency</Text>
      {CURRENCIES.map((currency) => (
        <TouchableOpacity
          key={currency.code}
          style={[
            styles.currencyOption,
            selectedCurrency.code === currency.code && styles.currencyOptionSelected,
          ]}
          onPress={() => {
            setSelectedCurrency(currency);
            setShowCurrencyPicker(false);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.currencyOptionContent}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{currency.code}</Text>
              <Text style={styles.currencyName}>{currency.name}</Text>
            </View>
            {selectedCurrency.code === currency.code && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </PremiumCard>
  );

  const PaymentSummary = () => {
    if (!amount || isNaN(parseFloat(amount))) return null;

    const numAmount = parseFloat(amount);
    const fee = numAmount * 0.025; // 2.5% fee
    const total = numAmount + fee;

    return (
      <PremiumCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>
            {selectedCurrency.symbol}{numAmount.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Processing Fee (2.5%)</Text>
          <Text style={styles.summaryValue}>
            {selectedCurrency.symbol}{fee.toFixed(2)}
          </Text>
        </View>
        
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>
            {selectedCurrency.symbol}{total.toFixed(2)}
          </Text>
        </View>
      </PremiumCard>
    );
  };

  return (
    <View style={styles.container}>
      <PremiumHeader 
        title="Send Payment"
        subtitle="Send money securely to anyone, anywhere"
        showBackButton={true}
        showNotifications={false}
        showProfile={false}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Payment Form */}
          <PremiumCard style={styles.formCard} elevation="lg">
            <Controller
              control={control}
              name="recipient"
              rules={{
                required: 'Recipient is required',
                minLength: {
                  value: 2,
                  message: 'Recipient name must be at least 2 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PremiumInput
                  label="Recipient"
                  placeholder="Enter recipient name or email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.recipient?.message}
                  leftIcon="person"
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="amount"
              rules={{
                required: 'Amount is required',
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Please enter a valid amount',
                },
                validate: (value) => {
                  const num = parseFloat(value);
                  if (num <= 0) return 'Amount must be greater than 0';
                  if (num > 10000) return 'Amount cannot exceed 10,000';
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PremiumInput
                  label="Amount"
                  placeholder="0.00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.amount?.message}
                  leftIcon="card"
                  keyboardType="decimal-pad"
                  rightIcon="calculator"
                  onRightIconPress={() => {
                    // Could implement a calculator modal
                  }}
                />
              )}
            />

            <View style={styles.currencySection}>
              <Text style={styles.currencyLabel}>Currency</Text>
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                activeOpacity={0.7}
              >
                <View style={styles.currencySelectorContent}>
                  <Text style={styles.currencySymbolLarge}>{selectedCurrency.symbol}</Text>
                  <View style={styles.currencyDetails}>
                    <Text style={styles.currencyCodeLarge}>{selectedCurrency.code}</Text>
                    <Text style={styles.currencyNameSmall}>{selectedCurrency.name}</Text>
                  </View>
                </View>
                <Ionicons 
                  name={showCurrencyPicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {showCurrencyPicker && <CurrencyPicker />}
          </PremiumCard>

          {/* Payment Summary */}
          <PaymentSummary />

          {/* Security Notice */}
          <PremiumCard style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <Text style={styles.securityTitle}>Secure Payment</Text>
            </View>
            <Text style={styles.securityText}>
              Your payment is protected by bank-level encryption and fraud monitoring.
            </Text>
          </PremiumCard>

          {/* Submit Button */}
          <PremiumButton
            title="Send Payment"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.submitButton}
            icon={<Ionicons name="send" size={20} color={colors.white} />}
          />

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  currencySection: {
    marginBottom: spacing.md,
  },
  currencyLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  currencySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbolLarge: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginRight: spacing.md,
    minWidth: 30,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCodeLarge: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  currencyNameSmall: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  currencyPicker: {
    marginTop: spacing.md,
  },
  currencyPickerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  currencyOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  currencyOptionSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  currencyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginRight: spacing.md,
    minWidth: 30,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  currencyName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  summaryTotalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  securityCard: {
    marginBottom: spacing.lg,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  securityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  securityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default SendPaymentScreen;
