import { DatabaseService } from '../services/DatabaseService';
import { WebhookService } from '../services/WebhookService';
import {
  CreateTransactionDTO,
  Transaction,
  TransactionResponse,
} from '../models/Transaction';

export class TransactionController {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  public async getUserTransactions(
    userId: number
  ): Promise<TransactionResponse[]> {
    const transactions = await this.db.getUserTransactions(userId);
    return transactions.map(this.mapToTransactionResponse);
  }

  public async createTransaction(
    userId: number,
    transactionData: CreateTransactionDTO
  ): Promise<TransactionResponse> {
    let createdTransaction: Transaction | null = null;
    
    try {
      // Create the transaction
      createdTransaction = await this.db.createTransaction({
        user_id: userId,
        ...transactionData,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      // Process the payment (in real-world scenario, this would interact with a payment processor)
      const processedTransaction = await this.processPayment(createdTransaction);

      // Trigger webhook
      await WebhookService.triggerPaymentWebhook({
        transactionId: processedTransaction.id,
        userId: processedTransaction.user_id,
        recipient: processedTransaction.recipient,
        amount: processedTransaction.amount,
        currency: processedTransaction.currency,
        timestamp: processedTransaction.timestamp,
      });

      return this.mapToTransactionResponse(processedTransaction);
    } catch (error) {
      // Update transaction status to failed if the transaction was created
      if (createdTransaction) {
        await this.db.updateTransactionStatus(
          createdTransaction.id,
          'failed'
        );
      }
      throw error instanceof Error 
        ? error 
        : new Error('Payment processing failed');
    }
  }

  private async processPayment(transaction: Transaction): Promise<Transaction> {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real application, this would integrate with a payment processor
    const success = Math.random() > 0.1; // 90% success rate

    if (!success) {
      throw new Error('Payment processing failed');
    }

    // Update transaction status to completed
    return await this.db.updateTransactionStatus(transaction.id, 'completed');
  }

  private mapToTransactionResponse(
    transaction: Transaction
  ): TransactionResponse {
    return {
      id: transaction.id,
      recipient: transaction.recipient,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      timestamp: transaction.timestamp,
    };
  }
}
