const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');

// Notion integration endpoints
router.get('/notion/databases', async (req, res) => {
  try {
    if (!process.env.NOTION_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Notion API key not configured'
      });
    }

    const response = await axios.get('https://api.notion.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      },
      data: {
        filter: { property: 'object', value: 'database' }
      }
    });

    res.json({
      success: true,
      databases: response.data.results
    });
  } catch (error) {
    logger.error('Notion databases error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Notion databases'
    });
  }
});

router.post('/notion/pages', async (req, res) => {
  try {
    const { databaseId, properties } = req.body;

    if (!process.env.NOTION_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Notion API key not configured'
      });
    }

    const response = await axios.post('https://api.notion.com/v1/pages', {
      parent: { database_id: databaseId },
      properties
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      page: response.data
    });
  } catch (error) {
    logger.error('Notion page creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Notion page'
    });
  }
});

// Airtable integration endpoints
router.get('/airtable/bases', async (req, res) => {
  try {
    if (!process.env.AIRTABLE_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Airtable API key not configured'
      });
    }

    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });

    res.json({
      success: true,
      bases: response.data.bases
    });
  } catch (error) {
    logger.error('Airtable bases error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Airtable bases'
    });
  }
});

router.get('/airtable/:baseId/:tableId/records', async (req, res) => {
  try {
    const { baseId, tableId } = req.params;

    if (!process.env.AIRTABLE_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Airtable API key not configured'
      });
    }

    const response = await axios.get(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });

    res.json({
      success: true,
      records: response.data.records
    });
  } catch (error) {
    logger.error('Airtable records error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Airtable records'
    });
  }
});

// Make.com integration endpoints
router.post('/make/webhook', async (req, res) => {
  try {
    const { scenarioId, data } = req.body;

    if (!process.env.MAKE_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Make.com API key not configured'
      });
    }

    // This would trigger a Make.com scenario
    // URL format would be specific to your Make.com setup
    const webhookUrl = `https://hook.integromat.com/${scenarioId}`;
    
    const response = await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      result: response.data
    });
  } catch (error) {
    logger.error('Make.com webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger Make.com scenario'
    });
  }
});

// Integration status check
router.get('/status', (req, res) => {
  const integrations = {
    notion: {
      configured: !!process.env.NOTION_API_KEY,
      status: process.env.NOTION_API_KEY ? 'ready' : 'not configured'
    },
    airtable: {
      configured: !!process.env.AIRTABLE_API_KEY,
      status: process.env.AIRTABLE_API_KEY ? 'ready' : 'not configured'
    },
    makecom: {
      configured: !!process.env.MAKE_API_KEY,
      status: process.env.MAKE_API_KEY ? 'ready' : 'not configured'
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      status: process.env.OPENAI_API_KEY ? 'ready' : 'not configured'
    }
  };

  res.json({
    success: true,
    integrations
  });
});

module.exports = router;