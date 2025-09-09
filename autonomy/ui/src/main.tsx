
import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";

Sentry.init({
	dsn: "YOUR_SENTRY_DSN_HERE", // Replace with your Sentry DSN
	integrations: [browserTracingIntegration()],
	tracesSampleRate: 1.0,
	environment: process.env.NODE_ENV,
});

createRoot(document.getElementById("root")!).render(<App />);
