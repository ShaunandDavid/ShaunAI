# ShaunAI Operator

Autonomous agent and operator console to replicate Shaun on a computer as his acting agent. Automates daily tasks, integrates with OpenAI, Notion, Airtable, and Make.com, and provides a unified web console for chat, task queueing, and operational triggers.

## Features

- **Unified Web Console**: Modern React-based dashboard with dark theme
- **Real-time Chat**: WebSocket-powered chat interface with OpenAI integration
- **Task Management**: Create, manage, and queue automated tasks
- **Operational Triggers**: Set up automated triggers based on schedules, webhooks, events, or conditions
- **External Integrations**: Connect to OpenAI, Notion, Airtable, and Make.com
- **Real-time Updates**: Live status updates and notifications
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ShaunandDavid/ShaunAI.git
cd ShaunAI
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration  
cp frontend/.env.example frontend/.env
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend React app on http://localhost:3000

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Other integrations (optional)
NOTION_API_KEY=your_notion_api_key_here
AIRTABLE_API_KEY=your_airtable_api_key_here
MAKE_API_KEY=your_make_api_key_here
```

### Frontend Environment Variables

Edit `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3001
```

## Usage

### Chat Interface
- Navigate to `/chat` to interact with ShaunAI
- Real-time communication via WebSocket
- Fallback to HTTP API if WebSocket is unavailable
- OpenAI integration provides intelligent responses

### Task Management
- Navigate to `/tasks` to manage automated tasks
- Create tasks with priorities and schedules
- Track task status (pending, in progress, completed, failed)
- Update and delete tasks as needed

### Operational Triggers
- Navigate to `/triggers` to set up automation
- Support for schedule, webhook, event, and condition-based triggers
- Enable/disable triggers individually
- Monitor trigger execution history

### External Integrations
- Navigate to `/integrations` to manage connections
- Configure API keys for external services
- Test connections to verify setup
- Monitor integration status and sync history

## Architecture

### Backend (Node.js + TypeScript)
- Express.js REST API
- Socket.IO for real-time communication
- Modular service architecture
- Winston logging
- Environment-based configuration

### Frontend (React + TypeScript)
- Vite build system
- Material-UI components
- React Router for navigation
- Socket.IO client for real-time updates
- Responsive design with dark theme

### Key Components
- **ChatService**: OpenAI integration and message processing
- **TaskService**: Task queue management and execution
- **TriggerService**: Operational trigger management
- **IntegrationService**: External service integrations

## Development

### Build

```bash
# Build both frontend and backend
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

### Production

```bash
# Start production server (backend only)
npm start

# Serve frontend build files with a web server
```

## API Endpoints

### Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history` - Get chat history

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Triggers
- `GET /api/triggers` - Get all triggers
- `POST /api/triggers` - Create new trigger
- `PUT /api/triggers/:id/toggle` - Toggle trigger
- `DELETE /api/triggers/:id` - Delete trigger

### Integrations
- `GET /api/integrations` - Get all integrations
- `GET /api/integrations/:service/status` - Get integration status
- `POST /api/integrations/:service/test` - Test integration
- `POST /api/integrations/:service/configure` - Configure integration

## License

MIT
