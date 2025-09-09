import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PowerSettingsNew as PowerIcon,
} from '@mui/icons-material';
import { triggersApi } from '../services/api';

interface Trigger {
  id: string;
  name: string;
  description?: string;
  type: 'schedule' | 'webhook' | 'event' | 'condition';
  condition: any;
  action: any;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export const Triggers: React.FC = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [_loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'schedule' as 'schedule' | 'webhook' | 'event' | 'condition',
    condition: '',
    action: '',
    enabled: true,
  });

  useEffect(() => {
    loadTriggers();
  }, []);

  const loadTriggers = async () => {
    try {
      const data = await triggersApi.getAllTriggers();
      setTriggers(data);
    } catch (error) {
      console.error('Error loading triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrigger = () => {
    setEditingTrigger(null);
    setFormData({
      name: '',
      description: '',
      type: 'schedule',
      condition: '',
      action: '',
      enabled: true,
    });
    setDialogOpen(true);
  };

  const handleEditTrigger = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setFormData({
      name: trigger.name,
      description: trigger.description || '',
      type: trigger.type,
      condition: JSON.stringify(trigger.condition, null, 2),
      action: JSON.stringify(trigger.action, null, 2),
      enabled: trigger.enabled,
    });
    setDialogOpen(true);
  };

  const handleSaveTrigger = async () => {
    try {
      const triggerData = {
        ...formData,
        condition: JSON.parse(formData.condition || '{}'),
        action: JSON.parse(formData.action || '{}'),
      };

      if (editingTrigger) {
        // Note: Update API not implemented in backend yet
        console.log('Update trigger:', triggerData);
      } else {
        await triggersApi.createTrigger(triggerData);
      }
      await loadTriggers();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving trigger:', error);
      alert('Error saving trigger. Please check the JSON format.');
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    if (confirm('Are you sure you want to delete this trigger?')) {
      try {
        await triggersApi.deleteTrigger(id);
        await loadTriggers();
      } catch (error) {
        console.error('Error deleting trigger:', error);
      }
    }
  };

  const handleToggleTrigger = async (id: string) => {
    try {
      await triggersApi.toggleTrigger(id);
      await loadTriggers();
    } catch (error) {
      console.error('Error toggling trigger:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'schedule': return 'primary';
      case 'webhook': return 'secondary';
      case 'event': return 'info';
      case 'condition': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Operational Triggers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTrigger}
        >
          Create Trigger
        </Button>
      </Box>

      <Grid container spacing={3}>
        {triggers.map((trigger) => (
          <Grid item xs={12} md={6} lg={4} key={trigger.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">
                    {trigger.name}
                  </Typography>
                  <Chip
                    label={trigger.enabled ? 'Enabled' : 'Disabled'}
                    color={trigger.enabled ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                {trigger.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {trigger.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={trigger.type}
                    color={getTypeColor(trigger.type) as any}
                    size="small"
                  />
                  <Chip
                    label={`${trigger.triggerCount} runs`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(trigger.createdAt).toLocaleDateString()}
                </Typography>
                {trigger.lastTriggered && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Last run: {new Date(trigger.lastTriggered).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => handleEditTrigger(trigger)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteTrigger(trigger.id)}>
                  <DeleteIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleToggleTrigger(trigger.id)}
                  color={trigger.enabled ? 'success' : 'default'}
                  title={trigger.enabled ? 'Disable' : 'Enable'}
                >
                  <PowerIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Trigger Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTrigger ? 'Edit Trigger' : 'Create New Trigger'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              label="Type"
            >
              <MenuItem value="schedule">Schedule</MenuItem>
              <MenuItem value="webhook">Webhook</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="condition">Condition</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Condition (JSON)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            placeholder='{"schedule": "0 9 * * 1-5"}'
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Action (JSON)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            placeholder='{"type": "create_task", "title": "Daily standup reminder"}'
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
            }
            label="Enabled"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTrigger} variant="contained">
            {editingTrigger ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};