export interface Transaction {
  id: number;
  user_id: number;
  recipient: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface CreateTransactionDTO {
  recipient: string;
  amount: number;
  currency: string;
}

export interface TransactionResponse {
  id: number;
  recipient: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}
