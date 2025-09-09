import { } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Tasks } from './pages/Tasks';
import { Triggers } from './pages/Triggers';
import { Integrations } from './pages/Integrations';
import { SocketProvider } from './contexts/SocketContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto Mono", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SocketProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/triggers" element={<Triggers />} />
              <Route path="/integrations" element={<Integrations />} />
            </Routes>
          </Layout>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
