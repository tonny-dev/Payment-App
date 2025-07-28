import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { DatabaseService } from './services/DatabaseService';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import analyticsRoutes from './routes/analytics';
import notificationsRoutes from './routes/notifications';
import profileRoutes from './routes/profile';
import searchRoutes from './routes/search';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: '*', // In production, you should specify your app's domain
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
DatabaseService.getInstance().initialize();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: [
      'Authentication',
      'Transactions',
      'Analytics',
      'Notifications',
      'Profile Management',
      'Advanced Search'
    ]
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Payment App API',
    version: '2.0.0',
    description: 'Premium payment processing API with advanced features',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      analytics: '/api/analytics',
      notifications: '/api/notifications',
      profile: '/api/profile',
      search: '/api/search',
    },
    documentation: '/api-docs.md',
  });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Payment App API v2.0.0 running on port ${PORT}`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`🔔 Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`👤 Profile: http://localhost:${PORT}/api/profile`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/search`);
});

export default app;
