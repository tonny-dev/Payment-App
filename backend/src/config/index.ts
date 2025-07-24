export interface DatabaseConfig {
  path: string;
  maxConnections?: number;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

export interface WebhookConfig {
  url: string;
  timeout: number;
  retryAttempts: number;
}

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  database: DatabaseConfig;
  security: SecurityConfig;
  webhook: WebhookConfig;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

const development: AppConfig = {
  env: 'development',
  port: 3000,
  database: {
    path: './database/app.db',
    maxConnections: 10,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    jwtExpiresIn: '7d',
    bcryptSaltRounds: 12,
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
  },
  webhook: {
    url:
      process.env.WEBHOOK_URL ||
      'https://usewebhook.com/02ab5031c7b88a66f5bff68b6130b30e',
    timeout: 5000,
    retryAttempts: 3,
  },
  cors: {
    origin: '*',
    credentials: true,
  },
};

const production: AppConfig = {
  env: 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    path: process.env.DB_PATH || './database/app.db',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  },
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    rateLimitWindow: parseInt(
      process.env.RATE_LIMIT_WINDOW || (15 * 60 * 1000).toString(),
      10
    ),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  webhook: {
    url: process.env.WEBHOOK_URL!,
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '5000', 10),
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '3', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [],
    credentials: true,
  },
};

const test: AppConfig = {
  env: 'test',
  port: 3001,
  database: {
    path: ':memory:', // Use in-memory SQLite for tests
    maxConnections: 1,
  },
  security: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1h',
    bcryptSaltRounds: 4,
    rateLimitWindow: 15 * 60 * 1000,
    rateLimitMax: 100,
  },
  webhook: {
    url: 'http://localhost:8080/webhook',
    timeout: 1000,
    retryAttempts: 0,
  },
  cors: {
    origin: '*',
    credentials: true,
  },
};

const configs = {
  development,
  production,
  test,
};

const nodeEnv = process.env.NODE_ENV || 'development';
const config = configs[nodeEnv as keyof typeof configs];

if (!config) {
  throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
}

export default config;
