const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/searchController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, SearchController.globalSearch);

module.exports = router;
