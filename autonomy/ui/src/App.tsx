import { useEffect, useState } from "react";
import type { Status } from "./types";
import { Sidebar } from "./components/Sidebar";
import { PreviewPane } from "./components/PreviewPane";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { getStatus, getTasks } from "./lib/api";
import { ChatWindow } from "./components/ChatWindow";
import { ChatComposer } from "./components/ChatComposer";
import "./App.css";

export default function App() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tasks, setTasks] = useState<string>("");

  async function refresh() {
    setStatus(await getStatus());
    setTasks(await getTasks());
  }
  useEffect(() => { refresh(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7f8] via-white to-[#eef1f7] text-black">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" />
            <h1 className="text-sm md:text-base font-semibold tracking-tight">ShaunAI — Operator</h1>
            <span className="hidden md:block text-xs text-black/60">plan → act → verify → log → next</span>
          </div>
          <div className="text-xs text-black/60">
            model: <b>{status?.model ?? "…"}</b> · queue: <b>{status?.tasks ?? "…"}</b> · time: <b>{status?.time ?? "…"}</b>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 grid grid-cols-12 gap-4">
        {/* LEFT: Status + Sidebar */}
        <section className="col-span-12 md:col-span-3 space-y-4">
          <Card className="backdrop-blur-md bg-white/70 shadow-xl shadow-black/5">
            <CardHeader><h2 className="text-lg font-semibold">Ops Snapshot</h2></CardHeader>
            <CardContent className="text-sm grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-black/10 bg-white/70 p-2">
                <div className="text-[11px] text-black/60">Model</div>
                <div className="font-medium">{status?.model ?? "…"}</div>
              </div>
              <div className="rounded-xl border border-black/10 bg-white/70 p-2">
                <div className="text-[11px] text-black/60">Queue</div>
                <div className="font-medium">{status?.tasks ?? "…"}</div>
              </div>
              <div className="rounded-xl border border-black/10 bg-white/70 p-2">
                <div className="text-[11px] text-black/60">Time</div>
                <div className="font-medium">{status?.time ?? "…"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/70 shadow-xl shadow-black/5">
            <CardHeader><h2 className="text-lg font-semibold">Queue Control</h2></CardHeader>
            <CardContent className="p-0">
              <Sidebar onRefresh={refresh} />
            </CardContent>
          </Card>
        </section>

        {/* CENTER: Live feed + composer + tasks */}
        <section className="col-span-12 md:col-span-6 space-y-4">
          <Card className="backdrop-blur-md bg-white/70 shadow-xl shadow-black/5">
            <CardContent className="p-0">
              <ChatWindow />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/70 shadow-xl shadow-black/5">
            <CardContent>
              <ChatComposer onQueued={(ok) => ok && refresh()} />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/70 shadow-xl shadow-black/5">
            <CardHeader><h2 className="text-lg font-semibold">Tasks (read-only)</h2></CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap opacity-80">{tasks || "(empty)"}</pre>
            </CardContent>
          </Card>
        </section>

        {/* RIGHT: Preview + artifacts */}
        <section className="col-span-12 md:col-span-3 space-y-4">
          <Card className="backdrop-blur-md bg-white/70 shadow-xl shadow-black/5">
            <CardHeader><h2 className="text-lg font-semibold">Preview</h2></CardHeader>
            <CardContent className="p-0">
              <PreviewPane />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/70 shadow-xl shadow-black/5">
            <CardHeader><h2 className="text-lg font-semibold">Artifacts</h2></CardHeader>
            <CardContent className="text-sm opacity-80">
              Check outputs in <code>/artifacts</code> and <code>/content</code>.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
