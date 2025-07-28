import express from 'express';
import { auth } from '../middleware/auth';
import {
  search,
  getSearchSuggestions,
  getRecentSearches,
  saveSearch,
} from '../controllers/searchController';

const router = express.Router();

// Perform search
router.post('/', auth, search);

// Get search suggestions
router.get('/suggestions', auth, getSearchSuggestions);

// Get recent searches
router.get('/recent', auth, getRecentSearches);

// Save search
router.post('/save', auth, saveSearch);

export default router;
