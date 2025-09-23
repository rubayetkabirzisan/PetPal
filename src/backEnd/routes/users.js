const express = require('express');
const authApiRoutes = require('./auth');
const router = express.Router();

// Redirect users routes to auth routes for compatibility
router.use('/login', authApiRoutes);
router.use('/signup', authApiRoutes);

// POST /api/users/login (compatibility route)
router.post('/login', (req, res, next) => {
  // This will be handled by the auth login route
  req.url = '/login';
  authApiRoutes(req, res, next);
});

// POST /api/users/signup (compatibility route)
router.post('/signup', (req, res, next) => {
  // This will be handled by the auth register route  
  req.url = '/register';
  authApiRoutes(req, res, next);
});

module.exports = router;