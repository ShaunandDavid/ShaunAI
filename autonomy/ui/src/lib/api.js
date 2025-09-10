// Get status (model, queue, time)
export async function getStatus() {
    const r = await fetch(`${API}/api/status`);
    if (!r.ok)
        throw new Error(await r.text());
    return r.json();
}
// Get tasks (read-only)
export async function getTasks() {
    const r = await fetch(`${API}/api/tasks`);
    if (!r.ok)
        throw new Error(await r.text());
    return r.text();
}
// Screenshot endpoint
export async function shot(url) {
    const r = await fetch(`${API}/api/shot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });
    if (!r.ok)
        throw new Error(await r.text());
    return r.json();
}
// Base URL: set in .env.local => VITE_API_BASE=http://localhost:3000
export const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:3000").replace(/\/$/, "");
const API = API_BASE;
// Queue a task
export async function setTask(text, priority = "HIGH") {
    const r = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority }),
    });
    if (!r.ok)
        throw new Error(await r.text());
    return r.json();
}
// Run exactly one task on the backend (you'll add the route below)
export async function runOne() {
    const r = await fetch(`${API}/api/run-one`, { method: "POST" });
    if (!r.ok)
        throw new Error(await r.text());
    return r.json();
}
// Drain the whole queue (backend route provided below)
export async function runDrain() {
    const r = await fetch(`${API}/api/drain`, { method: "POST" });
    if (!r.ok)
        throw new Error(await r.text());
    return r.json();
}
// Seed daily routines (backend route provided below)
export async function seedDaily() {
    const r = await fetch(`${API}/api/seed-daily`, { method: "POST" });
    if (!r.ok)
        throw new Error(await r.text());
    return r.json();
}
