import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
} from '@mui/icons-material';
import { integrationsApi } from '../services/api';

interface Integration {
  service: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  configured: boolean;
  lastSync?: string;
  errorMessage?: string;
}

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [_loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [configData, setConfigData] = useState({
    apiKey: '',
    baseUrl: '',
    workspace: '',
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await integrationsApi.getAllIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestIntegration = async (service: string) => {
    setTestResults({ ...testResults, [service]: { loading: true } });
    
    try {
      const result = await integrationsApi.testIntegration(service);
      setTestResults({ 
        ...testResults, 
        [service]: { loading: false, ...result } 
      });
      await loadIntegrations(); // Refresh status
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        [service]: { 
          loading: false, 
          success: false, 
          message: 'Test failed' 
        } 
      });
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigData({
      apiKey: '',
      baseUrl: '',
      workspace: '',
    });
    setConfigDialogOpen(true);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedIntegration) return;

    try {
      const result = await integrationsApi.configureIntegration(
        selectedIntegration.service,
        configData
      );
      
      if (result.success) {
        await loadIntegrations();
        setConfigDialogOpen(false);
      } else {
        alert('Configuration failed: ' + result.message);
      }
    } catch (error) {
      console.error('Error configuring integration:', error);
      alert('Configuration failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <ConnectedIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <ErrorIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getServiceInstructions = (service: string) => {
    switch (service) {
      case 'openai':
        return 'Get your API key from https://platform.openai.com/api-keys';
      case 'notion':
        return 'Create an integration at https://www.notion.so/my-integrations and get the API key';
      case 'airtable':
        return 'Get your API key from https://airtable.com/account';
      case 'make':
        return 'Get your API key from your Make.com profile settings';
      default:
        return 'Follow the service documentation to get your API credentials';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        External Integrations
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage connections to external services and platforms
      </Typography>

      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} md={6} lg={4} key={integration.service}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getStatusIcon(integration.status)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {integration.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {integration.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={integration.status}
                    color={getStatusColor(integration.status) as any}
                    size="small"
                  />
                  <Chip
                    label={integration.configured ? 'Configured' : 'Not Configured'}
                    color={integration.configured ? 'info' : 'warning'}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {integration.errorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {integration.errorMessage}
                  </Alert>
                )}

                {integration.lastSync && (
                  <Typography variant="caption" color="text.secondary">
                    Last sync: {new Date(integration.lastSync).toLocaleString()}
                  </Typography>
                )}

                {testResults[integration.service] && !testResults[integration.service].loading && (
                  <Alert 
                    severity={testResults[integration.service].success ? 'success' : 'error'} 
                    sx={{ mt: 1 }}
                  >
                    {testResults[integration.service].message}
                  </Alert>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={() => handleConfigureIntegration(integration)}
                >
                  Configure
                </Button>
                <Button
                  size="small"
                  startIcon={
                    testResults[integration.service]?.loading ? 
                    <CircularProgress size={16} /> : 
                    <TestIcon />
                  }
                  onClick={() => handleTestIntegration(integration.service)}
                  disabled={testResults[integration.service]?.loading}
                >
                  Test
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure {selectedIntegration?.name}
        </DialogTitle>
        <DialogContent>
          {selectedIntegration && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                {getServiceInstructions(selectedIntegration.service)}
              </Alert>
              
              <TextField
                autoFocus
                margin="dense"
                label="API Key"
                type="password"
                fullWidth
                variant="outlined"
                value={configData.apiKey}
                onChange={(e) => setConfigData({ ...configData, apiKey: e.target.value })}
                sx={{ mb: 2 }}
                helperText="Your API key will be securely stored"
              />
              
              {selectedIntegration.service === 'airtable' && (
                <TextField
                  margin="dense"
                  label="Base URL"
                  fullWidth
                  variant="outlined"
                  value={configData.baseUrl}
                  onChange={(e) => setConfigData({ ...configData, baseUrl: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="https://api.airtable.com/v0/appXXXXXXXXXXXXXX"
                />
              )}
              
              {selectedIntegration.service === 'notion' && (
                <TextField
                  margin="dense"
                  label="Workspace ID"
                  fullWidth
                  variant="outlined"
                  value={configData.workspace}
                  onChange={(e) => setConfigData({ ...configData, workspace: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="Optional: Your Notion workspace ID"
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfiguration} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};