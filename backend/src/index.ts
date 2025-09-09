import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { chatRoutes } from './routes/chat';
import { taskRoutes } from './routes/tasks';
import { triggerRoutes } from './routes/triggers';
import { integrationRoutes } from './routes/integrations';
import { ChatService } from './services/ChatService';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/integrations', integrationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO for real-time chat
const chatService = new ChatService();

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('chat_message', async (data) => {
    try {
      const response = await chatService.processMessage(data.message);
      socket.emit('chat_response', {
        message: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error processing chat message:', error);
      socket.emit('chat_error', { error: 'Failed to process message' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  logger.info(`ShaunAI Operator backend running on port ${PORT}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});

export { app, io };