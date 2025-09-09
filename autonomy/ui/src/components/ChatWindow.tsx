import React, { useEffect, useMemo, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useSSE } from "@/hooks/useSSE";
import type { StreamEvent } from "@/types";
import { API_BASE } from "@/lib/api";

const Dot: React.FC<{ color: string }> = React.memo(({ color }) => (
  <span className={`mt-1 inline-block h-2 w-2 rounded-full ${color}`} />
));
Dot.displayName = "Dot";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const roleColor = (role: "agent" | "operator" | "system") =>
  role === "agent" ? "bg-indigo-600" : role === "operator" ? "bg-emerald-600" : "bg-gray-500";

const statusColor = (s: "started" | "completed" | "error") =>
  s === "completed" ? "bg-emerald-600" : s === "error" ? "bg-rose-600" : "bg-sky-600";

function Row({ e }: { e: StreamEvent }) {
  if (e.type === "message") {
    return (
      <div className="flex gap-3">
        <Dot color={roleColor(e.role)} />
        <div className="flex-1">
          <div className="text-[11px] text-black/60">{fmtTime(e.at)} · {e.role}</div>
          <div className="rounded-xl border border-black/10 bg-white p-3 text-sm whitespace-pre-wrap">
            {e.content}
          </div>
        </div>
      </div>
    );
  }

  if (e.type === "log") {
    return (
      <div className="flex gap-3">
        <Dot color="bg-amber-600" />
        <div className="flex-1">
          <div className="text-[11px] text-black/60">{fmtTime(e.at)} · log</div>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50 p-3 text-sm whitespace-pre-wrap">
            {e.content}
            {e.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {e.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[11px] text-black/70"
                  >
                    {String(t).replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (e.type === "status") {
    return (
      <div className="flex gap-3">
        <Dot color={statusColor(e.status)} />
        <div className="flex-1">
          <div className="text-[11px] text-black/60">{fmtTime(e.at)} · status</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium">
            {e.status.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  if (e.type === "screenshot") {
    const src = /^https?:\/\//i.test(e.url) ? e.url : `${API_BASE}${e.url}`;
    return (
      <div className="flex gap-3">
        <Dot color="bg-cyan-600" />
        <div className="flex-1">
          <div className="text-[11px] text-black/60">{fmtTime(e.at)} · screenshot</div>
          <a href={src} target="_blank" rel="noreferrer" className="block">
            <img
              src={src}
              alt={e.title || "screenshot"}
              className="mt-1 w-full max-w-[560px] rounded-xl border border-black/10"
            />
            <div className="mt-1 text-xs text-black/60 line-clamp-1">
              {e.title || e.url}
            </div>
          </a>
        </div>
      </div>
    );
  }

  return null;
}

export const ChatWindow: React.FC = () => {
  const events = useSSE(`${API_BASE}/api/stream`);
  const items = useMemo(() => events as StreamEvent[], [events]); // ensure stable reference
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items.length]);

  return (
    <Card className="backdrop-blur-md bg-white/70 shadow-sm">
      <CardHeader>
        <h2 className="text-lg font-semibold">Live Feed</h2>
      </CardHeader>
      <CardContent>
        <div className="h-[50vh] md:h-[58vh] overflow-y-auto space-y-4 pr-2">
          {items.length === 0 ? (
            <div className="text-sm text-black/60">Waiting for events…</div>
          ) : (
            items.map((e, i) => <Row key={`${e.type}-${e.id ?? i}-${i}`} e={e} />)
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
};
