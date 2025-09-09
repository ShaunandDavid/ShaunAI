import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  CloudSync,
  Psychology,
} from '@mui/icons-material';

interface IntegrationStatus {
  openai: { configured: boolean; status: string };
  notion: { configured: boolean; status: string };
  airtable: { configured: boolean; status: string };
  makecom: { configured: boolean; status: string };
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    openai: { configured: false, status: 'not configured' },
    notion: { configured: false, status: 'not configured' },
    airtable: { configured: false, status: 'not configured' },
    makecom: { configured: false, status: 'not configured' },
  });

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status');
      const data = await response.json();
      if (data.success) {
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Error fetching integration status:', error);
    }
  };

  const getStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircle sx={{ color: 'success.main' }} />
    ) : (
      <Error sx={{ color: 'error.main' }} />
    );
  };

  const getStatusColor = (configured: boolean) => {
    return configured ? 'success' : 'error';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Integrations
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure your API keys and integrations to enable full ShaunAI Operator functionality.
        Note: This is a demo environment - configure these in your production .env file.
      </Alert>

      <Grid container spacing={3}>
        {/* OpenAI Integration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <Psychology />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">OpenAI</Typography>
                  <Chip
                    label={integrations.openai.status}
                    color={getStatusColor(integrations.openai.configured) as any}
                    size="small"
                  />
                </Box>
                {getStatusIcon(integrations.openai.configured)}
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Powers the autonomous AI agent with advanced language processing and decision-making capabilities.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Features:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="• Intelligent chat responses" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Task analysis and prioritization" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Compliance report generation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Recovery scenario planning" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notion Integration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                  N
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Notion</Typography>
                  <Chip
                    label={integrations.notion.status}
                    color={getStatusColor(integrations.notion.configured) as any}
                    size="small"
                  />
                </Box>
                {getStatusIcon(integrations.notion.configured)}
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manages documentation, knowledge base, and collaborative workspaces for recovery procedures.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Features:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="• Document management" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Knowledge base integration" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Collaborative workspaces" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Procedure documentation" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Airtable Integration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                  A
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Airtable</Typography>
                  <Chip
                    label={integrations.airtable.status}
                    color={getStatusColor(integrations.airtable.configured) as any}
                    size="small"
                  />
                </Box>
                {getStatusIcon(integrations.airtable.configured)}
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Structured data management for compliance tracking, incident records, and recovery metrics.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Features:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="• Compliance tracking" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Incident management" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Data analytics" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Recovery metrics" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Make.com Integration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
                  M
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Make.com</Typography>
                  <Chip
                    label={integrations.makecom.status}
                    color={getStatusColor(integrations.makecom.configured) as any}
                    size="small"
                  />
                </Box>
                {getStatusIcon(integrations.makecom.configured)}
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Automates workflows and connects ShaunAI with external systems for seamless operations.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Features:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="• Workflow automation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• System integrations" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Event triggers" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Process orchestration" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Integration Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Integration Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main">
                      {Object.values(integrations).filter(i => i.configured).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Integrations
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="error.main">
                      {Object.values(integrations).filter(i => !i.configured).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Setup
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main">
                      100%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Uptime
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="info.main">
                      24/7
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monitoring
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  To configure integrations in production:
                  <br />
                  1. Copy .env.example to .env
                  <br />
                  2. Add your API keys for each service
                  <br />
                  3. Restart the application
                  <br />
                  4. All integrations will be automatically activated
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Integrations;