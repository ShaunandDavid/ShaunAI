import { Router } from 'express';
import { TriggerService } from '../services/TriggerService';
import { logger } from '../config/logger';

const router = Router();
const triggerService = new TriggerService();

// GET /api/triggers - Get all triggers
router.get('/', async (req, res) => {
  try {
    const triggers = await triggerService.getAllTriggers();
    res.json(triggers);
  } catch (error) {
    logger.error('Error getting triggers:', error);
    res.status(500).json({ error: 'Failed to get triggers' });
  }
});

// POST /api/triggers - Create a new trigger
router.post('/', async (req, res) => {
  try {
    const { name, description, type, condition, action, enabled = true } = req.body;
    
    if (!name || !type || !condition || !action) {
      return res.status(400).json({ error: 'Name, type, condition, and action are required' });
    }

    const trigger = await triggerService.createTrigger({
      name,
      description,
      type,
      condition,
      action,
      enabled
    });
    
    res.status(201).json(trigger);
  } catch (error) {
    logger.error('Error creating trigger:', error);
    res.status(500).json({ error: 'Failed to create trigger' });
  }
});

// PUT /api/triggers/:id/toggle - Toggle trigger enabled status
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const trigger = await triggerService.toggleTrigger(id);
    
    if (!trigger) {
      return res.status(404).json({ error: 'Trigger not found' });
    }
    
    res.json(trigger);
  } catch (error) {
    logger.error('Error toggling trigger:', error);
    res.status(500).json({ error: 'Failed to toggle trigger' });
  }
});

// DELETE /api/triggers/:id - Delete a trigger
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await triggerService.deleteTrigger(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Trigger not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting trigger:', error);
    res.status(500).json({ error: 'Failed to delete trigger' });
  }
});

export { router as triggerRoutes };