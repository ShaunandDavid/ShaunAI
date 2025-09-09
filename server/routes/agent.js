const express = require('express');
const router = express.Router();
const openaiService = require('../services/openai');
const logger = require('../utils/logger');

// Agent chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], options = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build messages array for OpenAI
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const result = await openaiService.generateResponse(messages, options);

    if (result.success) {
      // Emit to connected clients via Socket.IO
      const io = req.app.get('io');
      io.emit('agent-response', {
        message: result.response,
        timestamp: new Date().toISOString(),
        usage: result.usage
      });

      res.json({
        success: true,
        response: result.response,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    logger.error('Agent chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Task analysis endpoint
router.post('/analyze-task', async (req, res) => {
  try {
    const { taskDescription, context } = req.body;

    if (!taskDescription) {
      return res.status(400).json({
        success: false,
        error: 'Task description is required'
      });
    }

    const result = await openaiService.analyzeTask(taskDescription, context);
    res.json(result);
  } catch (error) {
    logger.error('Task analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Compliance report generation
router.post('/compliance-report', async (req, res) => {
  try {
    const { data, template } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for report generation'
      });
    }

    const result = await openaiService.generateComplianceReport(data, template);
    res.json(result);
  } catch (error) {
    logger.error('Compliance report error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Recovery scenario processing
router.post('/recovery-scenario', async (req, res) => {
  try {
    const { scenario } = req.body;

    if (!scenario) {
      return res.status(400).json({
        success: false,
        error: 'Scenario data is required'
      });
    }

    const result = await openaiService.processRecoveryScenario(scenario);
    res.json(result);
  } catch (error) {
    logger.error('Recovery scenario error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Agent status and capabilities
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'active',
    capabilities: [
      'Real-time chat assistance',
      'Task analysis and prioritization',
      'Compliance report generation',
      'Recovery scenario planning',
      'Multi-system integration',
      'Automated workflow management'
    ],
    integrations: {
      openai: !!process.env.OPENAI_API_KEY,
      notion: !!process.env.NOTION_API_KEY,
      airtable: !!process.env.AIRTABLE_API_KEY,
      makecom: !!process.env.MAKE_API_KEY
    }
  });
});

module.exports = router;