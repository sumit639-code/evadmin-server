// routes/chat.routes.js
import express from 'express';
import * as chatController from "../controllers/chat.controller.js";
import * as adminChatController from "../controllers/adminChat.controller.js";
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// Regular chat endpoints
router.get('/', chatController.getUserChats);
router.get('/:id', chatController.getChatById);
router.post('/', chatController.createChat);
router.post('/message', chatController.sendMessage);
router.put('/:chatId/read', chatController.markAsRead);

// Admin approval endpoints
router.put('/:chatId/approve', chatController.approveChat);
router.put('/:chatId/block', chatController.blockChat);
router.put('/:chatId/unblock', chatController.unblockChat);
router.delete('/:chatId', chatController.deleteChat);

// Admin-specific endpoints
router.get('/admin/list', adminChatController.getAdminList);
router.get('/admin/all', adminChatController.getAllUserChats);

export default router;