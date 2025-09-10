# ShaunAI Operator Console

ALWAYS follow these instructions first before searching or running exploratory bash commands. Fallback to additional search and context gathering only if the information here is incomplete or found to be in error.

## Project Overview
ShaunAI is an autonomous AI operator console built with Node.js, Express, and React. It consists of three main components:
1. **Core autonomy system** (`autonomy/`) - AI task processing and automation
2. **Operator server** (`autonomy/server/`) - Express API server and web console  
3. **React UI** (`autonomy/ui/`) - Optional modern frontend (Vite + React)

## Bootstrap & Environment Setup

### Prerequisites
- Node.js 20+ (verified working with 20.19.5)
- npm 9+ (verified working with 10.8.2)

### Environment Configuration
ALWAYS create these environment files before starting:

**autonomy/.env** (required for core system):
```
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

**autonomy/server/.env** (required for server):
```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
PORT=3000
HOST=127.0.0.1
```

**autonomy/server/.env.example** (required by dotenv-safe):
```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
PORT=3000
HOST=127.0.0.1
```

### Install Dependencies
ALWAYS run these commands in order. NEVER CANCEL - wait for completion:

```bash
# Root dependencies - takes ~15 seconds
npm ci

# Core autonomy - takes ~3 seconds  
cd autonomy && PUPPETEER_SKIP_DOWNLOAD=true npm ci

# Server dependencies - takes ~30 seconds. NEVER CANCEL.
cd server && PUPPETEER_SKIP_DOWNLOAD=true npm ci --legacy-peer-deps

# UI dependencies - takes ~8 seconds
cd ../ui && npm ci
```

**CRITICAL NOTES:**
- PUPPETEER_SKIP_DOWNLOAD=true is REQUIRED due to firewall restrictions
- --legacy-peer-deps is REQUIRED for server due to zod version conflict between OpenAI package (expects zod ^3.23.8) and project (uses zod ^4.1.5)
- Set timeout to 60+ seconds for dependency installation commands

## Build Process

### Full Build
```bash
npm run build
```
- Root TypeScript compilation: ~1 second
- UI build (Vite): ~4 seconds. NEVER CANCEL.
- Server has no build step (pure Node.js)
- Total time: ~5 seconds

### Individual Builds
```bash
# UI only - takes ~4 seconds
cd autonomy/ui && npm run build

# TypeScript compilation only
tsc
```

## Running the Application

### Development Mode
```bash
# Server only (recommended for development)
npm run dev
# Opens at: http://127.0.0.1:3000

# Full stack (server + separate UI dev server)
npm run dev:full 
# Server: http://127.0.0.1:3000
# UI dev server: http://localhost:5173
```

### Core Autonomy System
```bash
cd autonomy

# Run task loop once
npm start

# Continuous task processing
npm run loop

# Development mode with debugging
npm run dev
```

## Validation & Testing

### Linting
```bash
# UI linting only (server has no lint script)
cd autonomy/ui && npm run lint
```

### Testing
**WARNING**: Test infrastructure is incomplete:
- Server: jest not found in node_modules despite being in package.json
- UI: vitest not found in node_modules despite being in package.json
- Testing commands will fail until dependencies are properly installed

### Manual Validation
ALWAYS verify changes by:
1. Starting the server: `npm run dev`
2. Opening http://127.0.0.1:3000 in browser
3. Confirming the console interface loads
4. Testing task queue functionality if modifying core systems

## Development Workflows

### Adding Features
1. ALWAYS create environment files first if not present
2. Install dependencies with proper flags
3. Make code changes
4. Test manually via browser console
5. Run UI linting: `cd autonomy/ui && npm run lint`

### Working with Environment Issues
- If server fails with "ENOENT: no such file or directory, open '.env.example'" → Create the .env.example file
- If "MissingEnvVarsError" → Ensure all variables in .env.example are present in .env
- If EADDRINUSE on port 3000 → Another process is using the port, stop it first

### Common File Locations
- Main server entry: `autonomy/server/src/index.js`
- Core AI loop: `autonomy/src/loop.js`
- Web console UI: `autonomy/server/public/` (built-in HTML/CSS/JS)
- React UI: `autonomy/ui/src/`
- Task definitions: `autonomy/server/src/core/runner.js`

## CI/CD Pipeline
Located at `.github/workflows/ci.yml`:
- Runs on push/PR to main branch
- Installs all dependencies
- Runs linting and typechecking
- Builds UI
- Note: Testing steps may fail due to incomplete test infrastructure

## Troubleshooting
- **401 invalid_api_key**: Add valid OpenAI key to `autonomy/.env`
- **Puppeteer download fails**: Use `PUPPETEER_SKIP_DOWNLOAD=true` with npm commands
- **zod version conflict**: Use `--legacy-peer-deps` for server dependency installation
- **Port conflicts**: Stop other services on port 3000 or change PORT in .env
- **Test commands fail**: Test infrastructure incomplete, focus on manual validation

## Time Expectations
- Dependency installation: 60 seconds total. NEVER CANCEL.
- UI build: 4 seconds. NEVER CANCEL.
- Server startup: 2-3 seconds
- Manual validation should take 30 seconds (start server + verify in browser)