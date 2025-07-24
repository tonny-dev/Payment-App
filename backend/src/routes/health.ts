import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { DatabaseService } from '../services/DatabaseService';
import { WebhookService } from '../services/WebhookService';
import Logger from '../services/Logger';
import config from '../config';
import os from 'os';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Cache health check results for 30 seconds
const healthCache = {
  data: null as any,
  lastUpdate: 0,
  ttl: 30000, // 30 seconds
};

// Rate limit health checks
const healthRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: 'Too many health check requests',
});

interface ServiceHealth {
  status: 'up' | 'down';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

interface HealthStatus {
  status: 'ok' | 'error' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    webhook: ServiceHealth;
  };
  memory: {
    used: number;
    total: number;
    freeMemPercentage: number;
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    const db = DatabaseService.getInstance();
    await db.runHealthCheck();
    return {
      status: 'up',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    Logger.error('Database health check failed:', error);
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkWebhookHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    await WebhookService.checkHealth();
    return {
      status: 'up',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    Logger.error('Webhook health check failed:', error);
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getHealthStatus(): Promise<HealthStatus> {
  // Use cached data if available and not expired
  if (
    healthCache.data &&
    Date.now() - healthCache.lastUpdate < healthCache.ttl
  ) {
    return healthCache.data;
  }

  const [dbHealth, webhookHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkWebhookHealth(),
  ]);

  const memoryUsage = process.memoryUsage();
  const heapUsed = memoryUsage.heapUsed / 1024 / 1024; // MB
  const heapTotal = memoryUsage.heapTotal / 1024 / 1024; // MB
  const rss = memoryUsage.rss / 1024 / 1024; // MB
  const external = memoryUsage.external / 1024 / 1024; // MB

  const healthStatus: HealthStatus = {
    status:
      dbHealth.status === 'up' && webhookHealth.status === 'up'
        ? 'ok'
        : dbHealth.status === 'down' && webhookHealth.status === 'down'
        ? 'error'
        : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.env,
    services: {
      database: dbHealth,
      webhook: webhookHealth,
    },
    memory: {
      used: Math.round(heapUsed * 100) / 100,
      total: Math.round(heapTotal * 100) / 100,
      freeMemPercentage: Math.round(((heapTotal - heapUsed) / heapTotal) * 100),
      rss: Math.round(rss * 100) / 100,
      heapUsed: Math.round(heapUsed * 100) / 100,
      heapTotal: Math.round(heapTotal * 100) / 100,
      external: Math.round(external * 100) / 100,
    },
  };

  // Update cache
  healthCache.data = healthStatus;
  healthCache.lastUpdate = Date.now();

  return healthStatus;
}

// Basic health check endpoint (public)
router.get('/health', healthRateLimit, async (_req: Request, res: Response) => {
  try {
    const healthStatus = await getHealthStatus();
    const statusCode =
      healthStatus.status === 'ok'
        ? 200
        : healthStatus.status === 'degraded'
        ? 200
        : 503;

    // Only return basic info for public endpoint
    const publicHealth = {
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
    };

    res.status(statusCode).json(publicHealth);
  } catch (error) {
    Logger.error('Health check failed:', error);
    res
      .status(500)
      .json({ status: 'error', timestamp: new Date().toISOString() });
  }
});

// Detailed health metrics (requires authentication)
router.get(
  '/health/detailed',
  authenticateToken,
  healthRateLimit,
  async (req: Request, res: Response) => {
    try {
      const healthStatus = await getHealthStatus();
      const startTime = process.hrtime();

      const detailedStatus = {
        ...healthStatus,
        system: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          resourceUsage: process.resourceUsage(),
          // Using os module for load average as it's more reliable cross-platform
          loadAvg: require('os').loadavg(),
        },
        process: {
          pid: process.pid,
          ppid: process.ppid,
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          env: {
            nodeEnv: process.env.NODE_ENV,
            timezone: process.env.TZ,
          },
        },
        request: {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          responseTime: process.hrtime(startTime),
        },
      };

      res.json(detailedStatus);
    } catch (error) {
      Logger.error('Detailed health check failed:', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  }
);

export default router;
