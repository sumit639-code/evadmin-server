// routes.js
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

// Import controllers
import * as transactionController from '../controllers/transaction.controller.js';

const router = express.Router();

// Transaction routes
router.get('/', authenticateToken, transactionController.getAllTransactions);
router.get('/:id', authenticateToken, transactionController.getTransactionById);
router.post('/', authenticateToken, requireAdmin, transactionController.createTransaction);
router.patch('/:id/status', authenticateToken, requireAdmin, transactionController.updateTransactionStatus);
router.delete('/:id', authenticateToken, requireAdmin, transactionController.deleteTransaction);
router.get('/stats', authenticateToken, requireAdmin, transactionController.getTransactionStats);



export default router;