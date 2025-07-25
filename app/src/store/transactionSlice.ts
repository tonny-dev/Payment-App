import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TransactionState } from '../types';
import ApiService from '../services/ApiServices';

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async () => {
    const response = await ApiService.getTransactions();
    return response.transactions;
  },
);

export const sendPayment = createAsyncThunk(
  'transactions/sendPayment',
  async ({
    recipient,
    amount,
    currency,
  }: {
    recipient: string;
    amount: number;
    currency: string;
  }) => {
    const response = await ApiService.sendPayment(recipient, amount, currency);
    return response.transaction;
  },
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTransactions.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(sendPayment.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        state.error = null;
      })
      .addCase(sendPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to send payment';
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
