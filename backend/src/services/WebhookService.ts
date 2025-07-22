import axios from 'axios';

interface PaymentWebhookData {
  transactionId: number;
  userId: number;
  recipient: string;
  amount: number;
  currency: string;
  timestamp: string;
}

export class WebhookService {
  private static readonly WEBHOOK_URL = 'https://webhook.site/unique-id'; // Replace with actual webhook URL

  public static async triggerPaymentWebhook(data: PaymentWebhookData): Promise<void> {
    try {
      const payload = {
        event: 'payment.sent',
        data: {
          transaction_id: data.transactionId,
          user_id: data.userId,
          recipient: data.recipient,
          amount: data.amount,
          currency: data.currency,
          timestamp: data.timestamp,
          status: 'completed'
        },
        timestamp: new Date().toISOString()
      };

      await axios.post(this.WEBHOOK_URL, payload, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PaymentApp-Webhook/1.0'
        }
      });

      console.log('Webhook triggered successfully for transaction:', data.transactionId);
    } catch (error) {
      console.error('Failed to trigger webhook:', error);
      throw error;
    }
  }
}