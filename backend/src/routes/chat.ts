import { Router } from 'express';
import { ChatService } from '../services/ChatService';
import { logger } from '../config/logger';

const router = Router();
const chatService = new ChatService();

// GET /api/chat/history - Get chat history
router.get('/history', (req, res) => {
  // TODO: Implement chat history retrieval from database
  res.json({ messages: [] });
});

// POST /api/chat/message - Send a chat message
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatService.processMessage(message);
    
    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in chat message endpoint:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export { router as chatRoutes };