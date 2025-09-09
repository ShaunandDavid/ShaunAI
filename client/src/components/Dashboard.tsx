import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Chat,
  CloudSync,
  Archive,
  Refresh,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface DashboardStats {
  activeTasks: number;
  completedTasks: number;
  chatSessions: number;
  artifacts: number;
  integrationStatus: {
    openai: boolean;
    notion: boolean;
    airtable: boolean;
    makecom: boolean;
  };
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    activeTasks: 0,
    completedTasks: 0,
    chatSessions: 0,
    artifacts: 0,
    integrationStatus: {
      openai: false,
      notion: false,
      airtable: false,
      makecom: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [agentStatus, setAgentStatus] = useState<'active' | 'idle' | 'error'>('active');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [tasksRes, chatRes, artifactsRes, integrationRes, agentRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/chat/stats'),
        fetch('/api/artifacts/stats/overview'),
        fetch('/api/integrations/status'),
        fetch('/api/agent/status'),
      ]);

      const tasksData = await tasksRes.json();
      const chatData = await chatRes.json();
      const artifactsData = await artifactsRes.json();
      const integrationData = await integrationRes.json();
      const agentData = await agentRes.json();

      setStats({
        activeTasks: tasksData.success ? tasksData.queue?.length || 0 : 0,
        completedTasks: tasksData.success 
          ? tasksData.tasks?.filter((t: any) => t.status === 'completed').length || 0 
          : 0,
        chatSessions: chatData.success ? chatData.stats?.totalSessions || 0 : 0,
        artifacts: artifactsData.success ? artifactsData.stats?.total || 0 : 0,
        integrationStatus: integrationData.success ? integrationData.integrations : {
          openai: false,
          notion: false,
          airtable: false,
          makecom: false,
        },
      });

      setAgentStatus(agentData.success ? 'active' : 'error');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAgentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    trend?: number;
  }> = ({ title, value, icon, color, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp 
              sx={{ 
                fontSize: 16, 
                mr: 1, 
                color: trend > 0 ? 'success.main' : 'error.main' 
              }} 
            />
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const getIntegrationIcon = (status: boolean) => {
    return status ? (
      <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
    ) : (
      <Error sx={{ color: 'error.main', fontSize: 16 }} />
    );
  };

  const getAgentStatusColor = () => {
    switch (agentStatus) {
      case 'active': return 'success';
      case 'idle': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          ShaunAI Operator Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`Agent Status: ${agentStatus.toUpperCase()}`}
            color={getAgentStatusColor() as any}
            variant="outlined"
          />
          <IconButton onClick={fetchDashboardData} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tasks"
            value={stats.activeTasks}
            icon={<Assignment />}
            color={theme.palette.primary.main}
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chat Sessions"
            value={stats.chatSessions}
            icon={<Chat />}
            color={theme.palette.secondary.main}
            trend={-2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Artifacts"
            value={stats.artifacts}
            icon={<Archive />}
            color={theme.palette.info.main}
            trend={25}
          />
        </Grid>

        {/* Agent Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Autonomous Agent Status
              </Typography>
              <Alert 
                severity={getAgentStatusColor() as any}
                sx={{ mb: 2 }}
              >
                Agent is currently {agentStatus} and monitoring all systems
              </Alert>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Recovery Planning" 
                    secondary="Ready to process emergency scenarios"
                  />
                  <CheckCircle sx={{ color: 'success.main' }} />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Compliance Monitoring" 
                    secondary="Continuously scanning for compliance issues"
                  />
                  <CheckCircle sx={{ color: 'success.main' }} />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Task Automation" 
                    secondary="Processing queue efficiently"
                  />
                  <CheckCircle sx={{ color: 'success.main' }} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Integration Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Integrations
              </Typography>
              <List dense>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <CloudSync />
                  </Avatar>
                  <ListItemText 
                    primary="OpenAI" 
                    secondary="AI processing and analysis"
                  />
                  {getIntegrationIcon(stats.integrationStatus.openai)}
                </ListItem>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                    N
                  </Avatar>
                  <ListItemText 
                    primary="Notion" 
                    secondary="Documentation and knowledge base"
                  />
                  {getIntegrationIcon(stats.integrationStatus.notion)}
                </ListItem>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                    A
                  </Avatar>
                  <ListItemText 
                    primary="Airtable" 
                    secondary="Data management and tracking"
                  />
                  {getIntegrationIcon(stats.integrationStatus.airtable)}
                </ListItem>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
                    M
                  </Avatar>
                  <ListItemText 
                    primary="Make.com" 
                    secondary="Workflow automation"
                  />
                  {getIntegrationIcon(stats.integrationStatus.makecom)}
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Agent Activity
              </Typography>
              <List>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <ListItemText 
                    primary="Compliance report generated successfully"
                    secondary="2 minutes ago"
                  />
                </ListItem>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Assignment />
                  </Avatar>
                  <ListItemText 
                    primary="New recovery task analyzed and prioritized"
                    secondary="5 minutes ago"
                  />
                </ListItem>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                    <CloudSync />
                  </Avatar>
                  <ListItemText 
                    primary="Data synchronized with Airtable"
                    secondary="8 minutes ago"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;