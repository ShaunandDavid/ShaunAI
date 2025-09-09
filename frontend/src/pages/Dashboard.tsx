import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  FlashOn as TriggerIcon,
  IntegrationInstructions as IntegrationIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { tasksApi, triggersApi, integrationsApi } from '../services/api';

interface DashboardStats {
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  triggers: {
    total: number;
    active: number;
  };
  integrations: {
    total: number;
    connected: number;
  };
}

export const Dashboard: React.FC = () => {
  const { connected } = useSocket();
  const [stats, setStats] = useState<DashboardStats>({
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    triggers: { total: 0, active: 0 },
    integrations: { total: 0, connected: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasks, triggers, integrations] = await Promise.all([
        tasksApi.getAllTasks(),
        triggersApi.getAllTriggers(),
        integrationsApi.getAllIntegrations(),
      ]);

      const taskStats = {
        total: tasks.length,
        pending: tasks.filter((t: any) => t.status === 'pending').length,
        inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
      };

      const triggerStats = {
        total: triggers.length,
        active: triggers.filter((t: any) => t.enabled).length,
      };

      const integrationStats = {
        total: integrations.length,
        connected: integrations.filter((i: any) => i.status === 'connected').length,
      };

      setStats({
        tasks: taskStats,
        triggers: triggerStats,
        integrations: integrationStats,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    stats: any;
    color: string;
  }> = ({ title, icon, stats, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color, mr: 1 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        {loading ? (
          <LinearProgress />
        ) : (
          <Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {stats.total || stats.connected || 0}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {stats.pending !== undefined && (
                <Chip label={`${stats.pending} Pending`} size="small" color="warning" />
              )}
              {stats.inProgress !== undefined && (
                <Chip label={`${stats.inProgress} In Progress`} size="small" color="info" />
              )}
              {stats.completed !== undefined && (
                <Chip label={`${stats.completed} Completed`} size="small" color="success" />
              )}
              {stats.active !== undefined && (
                <Chip label={`${stats.active} Active`} size="small" color="success" />
              )}
              {stats.connected !== undefined && (
                <Chip label={`${stats.connected} Connected`} size="small" color="success" />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to the ShaunAI Operator Console
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tasks"
            icon={<TaskIcon />}
            stats={stats.tasks}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Triggers"
            icon={<TriggerIcon />}
            stats={stats.triggers}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Integrations"
            icon={<IntegrationIcon />}
            stats={stats.integrations}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: '#9c27b0', mr: 1 }} />
                <Typography variant="h6" component="div">
                  System Status
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`Server: ${connected ? 'Connected' : 'Disconnected'}`}
                  color={connected ? 'success' : 'error'}
                />
                <Chip
                  label={`Tasks Processing: ${stats.tasks.inProgress > 0 ? 'Active' : 'Idle'}`}
                  color={stats.tasks.inProgress > 0 ? 'info' : 'default'}
                />
                <Chip
                  label={`Triggers: ${stats.triggers.active > 0 ? 'Active' : 'None'}`}
                  color={stats.triggers.active > 0 ? 'warning' : 'default'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};