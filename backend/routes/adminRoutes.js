const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProgress,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:userId', validateObjectId('userId'), updateUser);
router.delete('/users/:userId', validateObjectId('userId'), deleteUser);
router.get('/progress/:userId', validateObjectId('userId'), getUserProgress);

module.exports = router;