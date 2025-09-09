import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  Add,
  PlayArrow,
  Pause,
  CheckCircle,
  Cancel,
  Schedule,
  Psychology,
} from '@mui/icons-material';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  type: string;
  createdAt: string;
  updatedAt: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [queue, setQueue] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    type: 'general',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
        setQueue(data.queue || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      
      if (response.ok) {
        fetchTasks();
        setNewTaskOpen(false);
        setNewTask({ title: '', description: '', priority: 'medium', type: 'general' });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'cancelled': return <Cancel color="error" />;
      case 'in-progress': return <PlayArrow color="primary" />;
      default: return <Schedule color="action" />;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Task Queue Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewTaskOpen(true)}
        >
          New Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Queue Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Queue Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Tasks: {queue.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed: {tasks.filter(t => t.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {tasks.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Queue */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Queue
              </Typography>
              <List>
                {queue.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(task.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Chip
                              label={task.priority}
                              color={getPriorityColor(task.priority) as any}
                              size="small"
                            />
                            <Chip
                              label={task.status}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {task.status === 'pending' && (
                        <IconButton
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        >
                          <PlayArrow />
                        </IconButton>
                      )}
                      {task.status === 'in-progress' && (
                        <>
                          <IconButton
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            onClick={() => updateTaskStatus(task.id, 'pending')}
                          >
                            <Pause />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* All Tasks */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Tasks
              </Typography>
              <List>
                {tasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemIcon>
                      {getStatusIcon(task.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={task.priority}
                            color={getPriorityColor(task.priority) as any}
                            size="small"
                          />
                          <Chip
                            label={task.status}
                            variant="outlined"
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onClose={() => setNewTaskOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Type"
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTaskOpen(false)}>Cancel</Button>
          <Button onClick={createTask} variant="contained">Create Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;