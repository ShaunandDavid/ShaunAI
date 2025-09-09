const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory storage for demo
let chatSessions = [];
let messages = [];

// Get all chat sessions
router.get('/sessions', (req, res) => {
  res.json({
    success: true,
    sessions: chatSessions
  });
});

// Create new chat session
router.post('/sessions', (req, res) => {
  const { title = 'New Chat Session', type = 'general' } = req.body;

  const session = {
    id: uuidv4(),
    title,
    type,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    messageCount: 0
  };

  chatSessions.push(session);

  res.status(201).json({
    success: true,
    session
  });
});

// Get messages for a chat session
router.get('/sessions/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params;
  const sessionMessages = messages.filter(msg => msg.sessionId === sessionId);

  res.json({
    success: true,
    messages: sessionMessages
  });
});

// Send message in chat session
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, role = 'user' } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Check if session exists
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    const message = {
      id: uuidv4(),
      sessionId,
      role,
      content,
      timestamp: new Date().toISOString()
    };

    messages.push(message);

    // Update session stats
    session.lastActivity = new Date().toISOString();
    session.messageCount++;

    // Emit message to connected clients
    const io = req.app.get('io');
    io.to(`chat-${sessionId}`).emit('new-message', message);

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    logger.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const sessionIndex = chatSessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Chat session not found'
    });
  }

  // Remove session and its messages
  chatSessions.splice(sessionIndex, 1);
  messages = messages.filter(msg => msg.sessionId !== sessionId);

  res.json({
    success: true,
    message: 'Chat session deleted successfully'
  });
});

// Get chat statistics
router.get('/stats', (req, res) => {
  const stats = {
    totalSessions: chatSessions.length,
    totalMessages: messages.length,
    activeSessions: chatSessions.filter(s => {
      const lastActivity = new Date(s.lastActivity);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return lastActivity > oneHourAgo;
    }).length,
    averageMessagesPerSession: chatSessions.length > 0 ? messages.length / chatSessions.length : 0
  };

  res.json({
    success: true,
    stats
  });
});

module.exports = router;