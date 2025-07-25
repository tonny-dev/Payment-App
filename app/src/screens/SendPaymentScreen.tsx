import React, { useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '@components/ToastProvider';
import { sendPayment, clearError } from '@store/transactionSlice';
import { RootState } from '@store/index';

interface PaymentFormData {
  recipient: string;
  amount: string;
  currency: string;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN'];

const SendPaymentScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.transactions,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    defaultValues: {
      recipient: '',
      amount: '',
      currency: 'USD',
    },
  });

  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await dispatch(
        sendPayment({
          recipient: data.recipient,
          amount: parseFloat(data.amount),
          currency: data.currency,
        }),
      ).unwrap();

      showToast(
        `${data.currency} ${data.amount} sent to ${data.recipient}`,
        'success',
      );
      reset();
      navigation.goBack();
    } catch (err) {
      // Error handled by useEffect
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Send Payment</Title>

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
              <TextInput
                label="Recipient"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.recipient}
                style={styles.input}
                placeholder="Enter recipient name or account"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.recipient}>
            {errors.recipient?.message}
          </HelperText>

          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'Amount is required',
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'Invalid amount format',
              },
              validate: value =>
                parseFloat(value) > 0 || 'Amount must be greater than 0',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Amount"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.amount}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="0.00"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.amount}>
            {errors.amount?.message}
          </HelperText>

          <Controller
            control={control}
            name="currency"
            rules={{ required: 'Currency is required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.currencyContainer}>
                {CURRENCIES.map(curr => (
                  <Button
                    key={curr}
                    mode={value === curr ? 'contained' : 'outlined'}
                    onPress={() => onChange(curr)}
                    style={styles.currencyButton}
                    compact
                  >
                    {curr}
                  </Button>
                ))}
              </View>
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          >
            Send Payment
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
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
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  currencyButton: {
    margin: 4,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default SendPaymentScreen;
