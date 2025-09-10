# ShaunAI Operator Console

Operate autonomous AI tasks with a fast, CSP‑safe console, premium hero UI, and clean APIs.

## Quick Start

1) Requirements
- Node.js 20+
- npm 9+

2) Env setup
- Copy and edit envs:
  - Root: `autonomy/.env` — put your full OpenAI key
    - `OPENAI_API_KEY=sk-...` (single line, no quotes)
  - Server: `autonomy/server/.env`
    - Keep `OPENAI_API_KEY=` blank (dotenv-safe presence only)
    - Set `OPENAI_MODEL=gpt-4o`
    - Optionally set `PORT=3000`

3) Run
- From repo root:
  - Server only: `npm run dev`
  - Full stack (server + Vite UI): `npm run dev:full`

Open http://127.0.0.1:3000 and start chatting.

## Scripts
- `npm run dev` — starts the operator server.
- `npm run dev:full` — runs server and UI together.
- `npm run build` — builds server and UI artifacts.

## GitHub Actions
CI workflow at `.github/workflows/ci.yml` installs deps, lints, typechecks, tests, and builds the UI on pushes/PRs to `main`.

## Security & CSP
- No inline scripts or event handlers. All UI JS is in `autonomy/server/public/app.js`.
- `.env` files are ignored by git; add secrets only to local env or GitHub Actions secrets.

## Directory map
- `autonomy/server` — Express server, operator endpoints, static console.
- `autonomy/ui` — optional React/Vite UI (not required for the console).

## Troubleshooting
- 401 invalid_api_key: ensure `autonomy/.env` has a clean single‑line key.
- MissingEnvVarsError: ensure `autonomy/server/.env` has `OPENAI_API_KEY=` (blank) present.
- CSP errors: hard refresh; scripts now load from `/app.js`.

## License
MIT
\n\n## 🚀 Enhanced Agent Mode\n\nShaunAI now includes a powerful enhanced agent mode that provides autonomous operation with advanced capabilities:\n\n```bash\n# Run enhanced agent\nENHANCED_MODE=true npm run start\n\n# Or run integration demo\nnode dist/integration.js\n```\n\nSee [ENHANCED_AGENT_GUIDE.md](./ENHANCED_AGENT_GUIDE.md) for complete documentation.\n\n### Enhanced Capabilities\n- 🤖 Autonomous operation with 30-second cycles\n- 🌐 Advanced web automation and analysis  \n- 🧠 Multi-modal reasoning with memory\n- 📝 Content generation across formats\n- 📊 Data analysis and insights\n- 💻 Multi-language code generation\n- 🔍 Real-time system monitoring\n- 📈 Self-improvement through learning
