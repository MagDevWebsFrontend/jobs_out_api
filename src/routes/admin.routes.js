// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminNotificationController = require('../controllers/adminNotification.controller');
const { authenticate, authorize } = require('../middleware/auth');
const dbContext = require('../middleware/dbContext.middleware');

// POST /api/admin/notifications
router.post(
  '/notifications',
  authenticate,
  authorize('admin'),
  dbContext,
  adminNotificationController.sendBroadcast
);

module.exports = router;
