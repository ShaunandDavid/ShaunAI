import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Avatar,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send,
  Psychology,
  Person,
  Add,
  Settings,
  Download,
  Clear,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import io from 'socket.io-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  messageCount: number;
}

const Chat: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3001');
    
    socketRef.current.on('agent-response', (data: any) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, newMessage]);
      setLoading(false);
    });

    fetchSessions();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
        // Auto-select first session or create one if none exist
        if (data.sessions.length > 0) {
          setCurrentSession(data.sessions[0].id);
          fetchMessages(data.sessions[0].id);
        } else {
          handleCreateSession('New Chat');
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCreateSession = async (title: string) => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, type: 'general' }),
      });
      const data = await response.json();
      if (data.success) {
        setSessions(prev => [data.session, ...prev]);
        setCurrentSession(data.session.id);
        setMessages([]);
        setNewSessionOpen(false);
        setNewSessionTitle('');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentSession || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    // Clear input immediately
    const messageToSend = inputValue;
    setInputValue('');

    try {
      // Send to chat session
      await fetch(`/api/chat/sessions/${currentSession}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageToSend, role: 'user' }),
      });

      // Send to agent for processing
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory,
        }),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const exportChat = () => {
    const chatData = {
      sessionId: currentSession,
      messages: messages,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shaunai-chat-${currentSession}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearChat = async () => {
    if (!currentSession) return;
    
    try {
      await fetch(`/api/chat/sessions/${currentSession}`, {
        method: 'DELETE',
      });
      
      // Remove from sessions and create new one
      setSessions(prev => prev.filter(s => s.id !== currentSession));
      handleCreateSession('New Chat');
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2 }}>
      {/* Session Sidebar */}
      <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Chat Sessions</Typography>
          <IconButton 
            color="primary" 
            onClick={() => setNewSessionOpen(true)}
            size="small"
          >
            <Add />
          </IconButton>
        </Box>
        
        <List>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              button
              selected={currentSession === session.id}
              onClick={() => {
                setCurrentSession(session.id);
                fetchMessages(session.id);
              }}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" noWrap>
                  {session.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {session.messageCount} messages
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Interface */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <Psychology />
            </Avatar>
            <Box>
              <Typography variant="h6">ShaunAI Operator</Typography>
              <Chip 
                label="AI Agent Active" 
                size="small" 
                color="success" 
                variant="outlined"
              />
            </Box>
          </Box>
          <Box>
            <IconButton onClick={exportChat} title="Export Chat">
              <Download />
            </IconButton>
            <IconButton onClick={clearChat} title="Clear Chat">
              <Clear />
            </IconButton>
            <IconButton title="Settings">
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <CardContent sx={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2,
        }}>
          {messages.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary',
            }}>
              <Psychology sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Welcome to ShaunAI Operator
              </Typography>
              <Typography>
                I'm your autonomous agent for recovery and compliance. How can I assist you today?
              </Typography>
            </Box>
          )}
          
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  maxWidth: '70%',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' 
                      ? theme.palette.secondary.main 
                      : theme.palette.primary.main,
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.role === 'user' ? <Person /> : <Psychology />}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: message.role === 'user' 
                      ? theme.palette.secondary.main + '20'
                      : theme.palette.background.paper,
                    border: message.role === 'assistant' 
                      ? `1px solid ${theme.palette.primary.main}40`
                      : 'none',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                <Psychology />
              </Avatar>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  ShaunAI is thinking...
                </Typography>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask ShaunAI about recovery procedures, compliance requirements, or any other assistance..."
              disabled={loading}
              variant="outlined"
            />
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!inputValue.trim() || loading}
              sx={{ height: 56 }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Card>

      {/* New Session Dialog */}
      <Dialog open={newSessionOpen} onClose={() => setNewSessionOpen(false)}>
        <DialogTitle>Create New Chat Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Title"
            fullWidth
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateSession(newSessionTitle || 'New Chat');
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSessionOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleCreateSession(newSessionTitle || 'New Chat')}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat;