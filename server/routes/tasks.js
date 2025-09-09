const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory storage for demo (use database in production)
let tasks = [];
let taskQueue = [];

// Get all tasks
router.get('/', (req, res) => {
  res.json({
    success: true,
    tasks: tasks,
    queue: taskQueue
  });
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority = 'medium', type = 'general', metadata = {} } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    const task = {
      id: uuidv4(),
      title,
      description,
      priority,
      type,
      status: 'pending',
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(task);
    taskQueue.push(task);

    // Emit task creation event
    const io = req.app.get('io');
    io.emit('task-created', task);

    logger.info(`Task created: ${task.id} - ${task.title}`);

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    logger.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update task status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();

    // Remove from queue if completed
    if (status === 'completed' || status === 'cancelled') {
      taskQueue = taskQueue.filter(task => task.id !== id);
    }

    // Emit task update event
    const io = req.app.get('io');
    io.emit('task-updated', tasks[taskIndex]);

    res.json({
      success: true,
      task: tasks[taskIndex]
    });
  } catch (error) {
    logger.error('Task update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get task by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    task
  });
});

// Delete task
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  taskQueue = taskQueue.filter(task => task.id !== id);

  // Emit task deletion event
  const io = req.app.get('io');
  io.emit('task-deleted', { id });

  res.json({
    success: true,
    message: 'Task deleted successfully',
    task: deletedTask
  });
});

// Get queue status
router.get('/queue/status', (req, res) => {
  const queueStats = {
    total: taskQueue.length,
    pending: taskQueue.filter(task => task.status === 'pending').length,
    inProgress: taskQueue.filter(task => task.status === 'in-progress').length,
    high: taskQueue.filter(task => task.priority === 'high').length,
    medium: taskQueue.filter(task => task.priority === 'medium').length,
    low: taskQueue.filter(task => task.priority === 'low').length
  };

  res.json({
    success: true,
    queue: taskQueue,
    stats: queueStats
  });
});

module.exports = router;