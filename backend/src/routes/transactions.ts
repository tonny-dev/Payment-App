import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { TransactionController } from '../controllers/TransactionController';
import { CreateTransactionDTO } from '../models/Transaction';

const router = Router();
const transactionController = new TransactionController();

// Get user transactions
router.get(
  '/transactions',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const transactions = await transactionController.getUserTransactions(
        req.user.id
      );
      res.json({ transactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// Send payment
router.post(
  '/send',
  [
    authenticateToken,
    body('recipient').isLength({ min: 1 }).withMessage('Recipient is required'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom((value) => value > 0)
      .withMessage('Amount must be greater than 0'),
    body('currency')
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code')
      .toUpperCase(),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const transactionData: CreateTransactionDTO = {
        recipient: req.body.recipient,
        amount: parseFloat(req.body.amount),
        currency: req.body.currency,
      };

      const transaction = await transactionController.createTransaction(
        req.user.id,
        transactionData
      );

      res.status(201).json({
        message: 'Payment sent successfully',
        transaction,
      });
    } catch (error) {
      console.error('Send payment error:', error);
      if (error instanceof Error) {
        if (error.message === 'Payment processing failed') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Payment failed: ' + error.message });
        }
      } else {
        res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
);

export default router;
