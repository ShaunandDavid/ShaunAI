import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import type { Priority, TaskPayload } from "@/types";

type Props = {
  onQueued?: (ok: boolean, msg?: string) => void;
};

export const ChatComposer: React.FC<Props> = ({ onQueued }) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("HIGH");
  const [loading, setLoading] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  function parseSlash(t: string) {
    const m = t.trim().match(/^\/(shot|goto|audit|define)\s+(.+)/i);
    if (!m) return null;
    const [, cmd, arg] = m;
    if (cmd.toLowerCase() === "define") return { action: "define", term: arg.trim() };
    if (cmd.toLowerCase() === "audit")  return { action: "audit", url: arg.trim() };
    if (cmd.toLowerCase() === "shot")   return { action: "shot",  url: arg.trim() };
    if (cmd.toLowerCase() === "goto")   return { action: "goto",  url: arg.trim() };
    return null;
  }

  async function submit() {
    const t = text.trim();
    if (!t) return;
    setLoading(true);
    const slash = parseSlash(t);
    let payload: TaskPayload;
    if (slash) {
      payload = { text: t, priority, meta: slash };
    } else {
      payload = { text: t, priority };
    }
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setText("");
      onQueued?.(true, "Queued");
    } catch (e) {
      if (e instanceof Error) {
        onQueued?.(false, e.message);
      } else {
        onQueued?.(false, "Failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="p-3 border-b border-black/10 flex items-center gap-2">
        <select
          className="h-9 rounded-xl border border-black/15 bg-white px-2 text-xs"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          title="Priority"
        >
          <option value="HIGH">HIGH</option>
          <option value="MED">MED</option>
          <option value="LOW">LOW</option>
        </select>
        <div className="text-xs text-black/60">
          Enter to send • Shift+Enter for newline
        </div>
      </div>
      <div className="p-3">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a command… e.g., [HIGH] Audit level7hq.com and capture a screenshot"
          rows={3}
          className="w-full resize-none rounded-xl border border-black/15 bg-white p-3 text-sm outline-none focus:border-black/30"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={submit} disabled={loading || !text.trim()}>
            {loading ? "Queuing…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};
