import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { DatabaseService } from '../services/DatabaseService';
import { WebhookService } from '../services/WebhookService';

const router = Router();
const db = DatabaseService.getInstance();

// Get user transactions
router.get('/transactions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const transactions = await db.getUserTransactions(req.user!.id);
    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        recipient: t.recipient,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        timestamp: t.timestamp
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send payment
router.post('/send', [
  authenticateToken,
  body('recipient').isLength({ min: 1 }),
  body('amount').isNumeric().custom(value => value > 0),
  body('currency').isLength({ min: 3, max: 3 })
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipient, amount, currency } = req.body;

    // Create transaction
    const transaction = await db.createTransaction(
      req.user!.id,
      recipient,
      parseFloat(amount),
      currency.toUpperCase()
    );

    // Trigger webhook (bonus feature)
    try {
      await WebhookService.triggerPaymentWebhook({
        transactionId: transaction.id,
        userId: req.user!.id,
        recipient,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        timestamp: transaction.timestamp
      });
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      // Don't fail the transaction if webhook fails
    }

    res.status(201).json({
      message: 'Payment sent successfully',
      transaction: {
        id: transaction.id,
        recipient: transaction.recipient,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        timestamp: transaction.timestamp
      }
    });
  } catch (error) {
    console.error('Send payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

export default router;