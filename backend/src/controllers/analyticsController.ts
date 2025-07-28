import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

interface AnalyticsData {
  revenue?: Array<{ period: string; value: number }>;
  merchants?: Array<{ status: string; count: number; color: string }>;
  transactions?: Array<{ type: string; count: number; color: string }>;
  apiCalls?: Array<{ period: string; value: number }>;
  endpoints?: Array<{ name: string; calls: number; color: string }>;
  responseTime?: Array<{ range: string; count: number; color: string }>;
}

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { period = 'month' } = req.query;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let analyticsData: AnalyticsData = {};

    if (user.role === 'psp') {
      // PSP Analytics
      analyticsData = {
        revenue: [
          { period: 'Jan', value: 12500 },
          { period: 'Feb', value: 15200 },
          { period: 'Mar', value: 18900 },
          { period: 'Apr', value: 22100 },
          { period: 'May', value: 19800 },
          { period: 'Jun', value: 25400 },
        ],
        merchants: [
          { status: 'Active', count: 15, color: '#10B981' },
          { status: 'Pending', count: 3, color: '#F59E0B' },
          { status: 'Inactive', count: 2, color: '#EF4444' },
        ],
        transactions: [
          { type: 'Successful', count: 1247, color: '#10B981' },
          { type: 'Failed', count: 23, color: '#EF4444' },
          { type: 'Pending', count: 8, color: '#F59E0B' },
        ],
      };
    } else {
      // Developer Analytics
      analyticsData = {
        apiCalls: [
          { period: 'Mon', value: 45 },
          { period: 'Tue', value: 52 },
          { period: 'Wed', value: 38 },
          { period: 'Thu', value: 61 },
          { period: 'Fri', value: 48 },
          { period: 'Sat', value: 29 },
          { period: 'Sun', value: 35 },
        ],
        endpoints: [
          { name: '/transactions', calls: 156, color: '#6366F1' },
          { name: '/send', calls: 89, color: '#10B981' },
          { name: '/auth', calls: 67, color: '#F59E0B' },
          { name: '/webhooks', calls: 34, color: '#3B82F6' },
        ],
        responseTime: [
          { range: '< 100ms', count: 234, color: '#10B981' },
          { range: '100-500ms', count: 89, color: '#F59E0B' },
          { range: '> 500ms', count: 12, color: '#EF4444' },
        ],
      };
    }

    res.json({
      success: true,
      data: analyticsData,
      period,
      role: user.role,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let metrics;

    if (user.role === 'psp') {
      metrics = {
        revenue: { value: '$25.4K', change: '+12.5%', trend: 'up' },
        merchants: { value: '15', change: '+3', trend: 'up' },
        successRate: { value: '98.2%', change: '+0.8%', trend: 'up' },
        avgTransaction: { value: '$156', change: '+5.2%', trend: 'up' },
      };
    } else {
      metrics = {
        apiCalls: { value: '1,247', change: '+18.2%', trend: 'up' },
        successRate: { value: '99.1%', change: '+0.3%', trend: 'up' },
        avgResponse: { value: '89ms', change: '-12ms', trend: 'down' },
        errors: { value: '12', change: '-8', trend: 'down' },
      };
    }

    res.json({
      success: true,
      data: metrics,
      role: user.role,
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { format = 'csv', dateRange = 'month' } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Simulate data export
    const exportId = `export_${Date.now()}_${user.id}`;
    
    // In a real implementation, you would:
    // 1. Generate the actual export file
    // 2. Store it temporarily
    // 3. Return a download URL

    res.json({
      success: true,
      message: 'Export initiated successfully',
      exportId,
      format,
      dateRange,
      estimatedTime: '2-3 minutes',
      downloadUrl: `/api/analytics/download/${exportId}`,
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to initiate data export' });
  }
};
