import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { CreateUserDTO } from '../models/User';

const router = Router();
const authController = new AuthController();

// Signup endpoint
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .isIn(['psp', 'dev'])
      .withMessage('Role must be either "psp" or "dev"'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const userData: CreateUserDTO = {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      };

      const { token, user } = await authController.signup(userData);

      res.status(201).json({
        message: 'User created successfully',
        token,
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User already exists') {
          res.status(409).json({ error: error.message });
        } else {
          console.error('Signup error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
);

// Login endpoint
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { email, password } = req.body;
      const { token, user } = await authController.login(email, password);

      res.json({
        message: 'Login successful',
        token,
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
          res.status(401).json({ error: error.message });
        } else {
          console.error('Login error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
);

export default router;
