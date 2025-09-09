import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { chatApi } from '../services/api';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chat: React.FC = () => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history on component mount
    loadChatHistory();
  }, []);

  useEffect(() => {
    // Set up socket listeners
    if (socket) {
      socket.on('chat_response', (data) => {
        const newMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          text: data.message,
          sender: 'bot',
          timestamp: new Date(data.timestamp),
        };
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(false);
      });

      socket.on('chat_error', (data) => {
        console.error('Chat error:', data.error);
        setIsLoading(false);
      });

      return () => {
        socket.off('chat_response');
        socket.off('chat_error');
      };
    }
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      await chatApi.getHistory();
      // Convert history to chat messages format if needed
      // setMessages(history.messages || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const messageText = inputText.trim();
    setInputText('');

    if (socket && connected) {
      // Use real-time socket communication
      socket.emit('chat_message', { message: messageText });
    } else {
      // Fallback to HTTP API
      try {
        const response = await chatApi.sendMessage(messageText);
        const botMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          text: response.response,
          sender: 'bot',
          timestamp: new Date(response.timestamp),
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          text: 'Sorry, I encountered an error processing your message.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Chat with ShaunAI
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label={connected ? 'Real-time' : 'API Only'} 
            color={connected ? 'success' : 'warning'}
            size="small"
          />
          <IconButton onClick={clearChat} title="Clear chat">
            <ClearIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Area */}
      <Paper 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          p: 1, 
          mb: 2,
          backgroundColor: 'background.default'
        }}
      >
        <List sx={{ pb: 0 }}>
          {messages.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="Welcome to ShaunAI!"
                secondary="I'm your autonomous agent. How can I help you today?"
              />
            </ListItem>
          ) : (
            messages.map((message) => (
              <ListItem key={message.id} sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    {message.sender === 'user' ? (
                      <PersonIcon color="primary" />
                    ) : (
                      <BotIcon color="secondary" />
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {message.text}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))
          )}
          {isLoading && (
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BotIcon color="secondary" sx={{ mr: 2 }} />
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  ShaunAI is thinking...
                </Typography>
              </Box>
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Type your message here... (Press Enter to send)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!inputText.trim() || isLoading}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};