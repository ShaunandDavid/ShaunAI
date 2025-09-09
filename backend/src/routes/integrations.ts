import { Router } from 'express';
import { IntegrationService } from '../services/IntegrationService';
import { logger } from '../config/logger';

const router = Router();
const integrationService = new IntegrationService();

// GET /api/integrations - Get all integrations
router.get('/', async (req, res) => {
  try {
    const integrations = await integrationService.getAllIntegrations();
    res.json(integrations);
  } catch (error) {
    logger.error('Error getting integrations:', error);
    res.status(500).json({ error: 'Failed to get integrations' });
  }
});

// GET /api/integrations/:service/status - Get integration status
router.get('/:service/status', async (req, res) => {
  try {
    const { service } = req.params;
    const status = await integrationService.getIntegrationStatus(service);
    res.json(status);
  } catch (error) {
    logger.error(`Error getting ${req.params.service} integration status:`, error);
    res.status(500).json({ error: 'Failed to get integration status' });
  }
});

// POST /api/integrations/:service/test - Test integration connection
router.post('/:service/test', async (req, res) => {
  try {
    const { service } = req.params;
    const result = await integrationService.testIntegration(service);
    res.json(result);
  } catch (error) {
    logger.error(`Error testing ${req.params.service} integration:`, error);
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

// POST /api/integrations/:service/configure - Configure integration
router.post('/:service/configure', async (req, res) => {
  try {
    const { service } = req.params;
    const { config } = req.body;
    
    const result = await integrationService.configureIntegration(service, config);
    res.json(result);
  } catch (error) {
    logger.error(`Error configuring ${req.params.service} integration:`, error);
    res.status(500).json({ error: 'Failed to configure integration' });
  }
});

export { router as integrationRoutes };