import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

interface SearchFilters {
  type?: 'all' | 'sent' | 'received';
  status?: 'all' | 'completed' | 'pending' | 'failed';
  currency?: 'all' | 'USD' | 'EUR' | 'GBP' | 'KES' | 'NGN';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  amountMin?: number;
  amountMax?: number;
}

interface SearchResult {
  id: string;
  type: 'transaction' | 'user' | 'merchant';
  title: string;
  description: string;
  metadata: any;
  relevanceScore: number;
}

// Mock transaction data for search
const mockTransactions = [
  {
    id: '1',
    recipient: 'John Doe',
    amount: 250.00,
    currency: 'USD',
    timestamp: '2024-01-28T10:30:00Z',
    status: 'completed',
    type: 'sent',
  },
  {
    id: '2',
    recipient: 'Alice Smith',
    amount: 150.75,
    currency: 'EUR',
    timestamp: '2024-01-27T16:45:00Z',
    status: 'failed',
    type: 'sent',
  },
  {
    id: '3',
    recipient: 'Bob Johnson',
    amount: 500.00,
    currency: 'USD',
    timestamp: '2024-01-26T09:15:00Z',
    status: 'completed',
    type: 'received',
  },
  {
    id: '4',
    recipient: 'Carol Wilson',
    amount: 75.25,
    currency: 'GBP',
    timestamp: '2024-01-25T14:20:00Z',
    status: 'pending',
    type: 'sent',
  },
  {
    id: '5',
    recipient: 'David Brown',
    amount: 1000.00,
    currency: 'USD',
    timestamp: '2024-01-24T11:30:00Z',
    status: 'completed',
    type: 'received',
  },
];

export const search = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { 
      query = '', 
      filters = {}, 
      limit = 20, 
      offset = 0,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const searchFilters: SearchFilters = filters;
    let results: SearchResult[] = [];

    // Search transactions
    let filteredTransactions = [...mockTransactions];

    // Apply text search
    if (query.trim()) {
      const searchQuery = query.toLowerCase();
      filteredTransactions = filteredTransactions.filter(transaction =>
        transaction.recipient.toLowerCase().includes(searchQuery) ||
        transaction.currency.toLowerCase().includes(searchQuery) ||
        transaction.amount.toString().includes(searchQuery) ||
        transaction.status.toLowerCase().includes(searchQuery)
      );
    }

    // Apply filters
    if (searchFilters.type && searchFilters.type !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.type === searchFilters.type);
    }

    if (searchFilters.status && searchFilters.status !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.status === searchFilters.status);
    }

    if (searchFilters.currency && searchFilters.currency !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.currency === searchFilters.currency);
    }

    // Date range filter
    if (searchFilters.dateRange && searchFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (searchFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.timestamp) >= filterDate
      );
    }

    // Amount range filter
    if (searchFilters.amountMin !== undefined || searchFilters.amountMax !== undefined) {
      const min = searchFilters.amountMin || 0;
      const max = searchFilters.amountMax || Infinity;
      
      filteredTransactions = filteredTransactions.filter(t => 
        t.amount >= min && t.amount <= max
      );
    }

    // Convert transactions to search results
    results = filteredTransactions.map(transaction => ({
      id: transaction.id,
      type: 'transaction' as const,
      title: `${transaction.type === 'sent' ? 'Payment to' : 'Payment from'} ${transaction.recipient}`,
      description: `${transaction.currency} ${transaction.amount.toFixed(2)} • ${transaction.status}`,
      metadata: transaction,
      relevanceScore: calculateRelevanceScore(transaction, query),
    }));

    // Sort results
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } else if (sortBy === 'date') {
      results.sort((a, b) => {
        const dateA = new Date(a.metadata.timestamp).getTime();
        const dateB = new Date(b.metadata.timestamp).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    } else if (sortBy === 'amount') {
      results.sort((a, b) => {
        const amountA = a.metadata.amount;
        const amountB = b.metadata.amount;
        return sortOrder === 'desc' ? amountB - amountA : amountA - amountB;
      });
    }

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedResults = results.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: results.length,
        limit: limitNum,
        offset: startIndex,
        hasMore: startIndex + limitNum < results.length,
      },
      query,
      filters: searchFilters,
      executionTime: Math.random() * 100 + 50, // Mock execution time
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

export const getSearchSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { query = '' } = req.query;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const searchQuery = (query as string).toLowerCase();
    const suggestions: string[] = [];

    // Generate suggestions based on query
    if (searchQuery.length > 0) {
      // Recipient suggestions
      const recipients = [...new Set(mockTransactions.map(t => t.recipient))];
      const matchingRecipients = recipients.filter(r => 
        r.toLowerCase().includes(searchQuery)
      );
      suggestions.push(...matchingRecipients.slice(0, 3));

      // Currency suggestions
      const currencies = ['USD', 'EUR', 'GBP', 'KES', 'NGN'];
      const matchingCurrencies = currencies.filter(c => 
        c.toLowerCase().includes(searchQuery)
      );
      suggestions.push(...matchingCurrencies);

      // Status suggestions
      const statuses = ['completed', 'pending', 'failed'];
      const matchingStatuses = statuses.filter(s => 
        s.toLowerCase().includes(searchQuery)
      );
      suggestions.push(...matchingStatuses);
    }

    // Add popular searches if no query
    if (searchQuery.length === 0) {
      suggestions.push(
        'Recent payments',
        'Failed transactions',
        'USD payments',
        'This month',
        'Large amounts'
      );
    }

    res.json({
      success: true,
      data: suggestions.slice(0, 8), // Limit to 8 suggestions
      query: searchQuery,
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
};

export const getRecentSearches = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Mock recent searches (in production, store in database)
    const recentSearches = [
      'John Doe',
      'Failed transactions',
      'USD 500',
      'This week',
      'Alice Smith',
    ];

    res.json({
      success: true,
      data: recentSearches,
    });
  } catch (error) {
    console.error('Recent searches error:', error);
    res.status(500).json({ error: 'Failed to get recent searches' });
  }
};

export const saveSearch = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { query, filters } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // In production, save search to database
    console.log('Saving search for user:', user.id, { query, filters });

    res.json({
      success: true,
      message: 'Search saved successfully',
    });
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({ error: 'Failed to save search' });
  }
};

// Helper function to calculate relevance score
function calculateRelevanceScore(transaction: any, query: string): number {
  if (!query.trim()) return 1;

  const searchQuery = query.toLowerCase();
  let score = 0;

  // Exact matches get higher scores
  if (transaction.recipient.toLowerCase() === searchQuery) score += 10;
  else if (transaction.recipient.toLowerCase().includes(searchQuery)) score += 5;

  if (transaction.currency.toLowerCase() === searchQuery) score += 8;
  if (transaction.status.toLowerCase() === searchQuery) score += 6;
  if (transaction.amount.toString().includes(searchQuery)) score += 4;

  // Recent transactions get slight boost
  const daysSinceTransaction = (Date.now() - new Date(transaction.timestamp).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceTransaction < 7) score += 2;
  else if (daysSinceTransaction < 30) score += 1;

  return Math.max(score, 0.1); // Minimum score
}
