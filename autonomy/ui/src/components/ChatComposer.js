import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
export const ChatComposer = ({ onQueued }) => {
    const [text, setText] = useState("");
    const [priority, setPriority] = useState("HIGH");
    const [loading, setLoading] = useState(false);
    const taRef = useRef(null);
    useEffect(() => {
        taRef.current?.focus();
    }, []);
    function parseSlash(t) {
        const m = t.trim().match(/^\/(shot|goto|audit|define)\s+(.+)/i);
        if (!m)
            return null;
        const [, cmd, arg] = m;
        if (cmd.toLowerCase() === "define")
            return { action: "define", term: arg.trim() };
        if (cmd.toLowerCase() === "audit")
            return { action: "audit", url: arg.trim() };
        if (cmd.toLowerCase() === "shot")
            return { action: "shot", url: arg.trim() };
        if (cmd.toLowerCase() === "goto")
            return { action: "goto", url: arg.trim() };
        return null;
    }
    async function submit() {
        const t = text.trim();
        if (!t)
            return;
        setLoading(true);
        const slash = parseSlash(t);
        let payload;
        if (slash) {
            payload = { text: t, priority, meta: slash };
        }
        else {
            payload = { text: t, priority };
        }
        try {
            const res = await fetch(`${API_BASE}/api/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok)
                throw new Error(await res.text());
            setText("");
            onQueued?.(true, "Queued");
        }
        catch (e) {
            if (e instanceof Error) {
                onQueued?.(false, e.message);
            }
            else {
                onQueued?.(false, "Failed");
            }
        }
        finally {
            setLoading(false);
        }
    }
    function onKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    }
    return (_jsxs("div", { className: "rounded-2xl border border-black/10 bg-white shadow-sm", children: [_jsxs("div", { className: "p-3 border-b border-black/10 flex items-center gap-2", children: [_jsxs("select", { className: "h-9 rounded-xl border border-black/15 bg-white px-2 text-xs", value: priority, onChange: (e) => setPriority(e.target.value), title: "Priority", children: [_jsx("option", { value: "HIGH", children: "HIGH" }), _jsx("option", { value: "MED", children: "MED" }), _jsx("option", { value: "LOW", children: "LOW" })] }), _jsx("div", { className: "text-xs text-black/60", children: "Enter to send \u2022 Shift+Enter for newline" })] }), _jsxs("div", { className: "p-3", children: [_jsx("textarea", { ref: taRef, value: text, onChange: (e) => setText(e.target.value), onKeyDown: onKeyDown, placeholder: "Type a command\u2026 e.g., [HIGH] Audit level7hq.com and capture a screenshot", rows: 3, className: "w-full resize-none rounded-xl border border-black/15 bg-white p-3 text-sm outline-none focus:border-black/30" }), _jsx("div", { className: "mt-2 flex justify-end", children: _jsx(Button, { onClick: submit, disabled: loading || !text.trim(), children: loading ? "Queuing…" : "Send" }) })] })] }));
};
