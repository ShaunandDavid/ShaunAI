import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useSSE } from "@/hooks/useSSE";
import { API_BASE } from "@/lib/api";
const Dot = React.memo(({ color }) => (_jsx("span", { className: `mt-1 inline-block h-2 w-2 rounded-full ${color}` })));
Dot.displayName = "Dot";
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const roleColor = (role) => role === "agent" ? "bg-indigo-600" : role === "operator" ? "bg-emerald-600" : "bg-gray-500";
const statusColor = (s) => s === "completed" ? "bg-emerald-600" : s === "error" ? "bg-rose-600" : "bg-sky-600";
function Row({ e }) {
    if (e.type === "message") {
        return (_jsxs("div", { className: "flex gap-3", children: [_jsx(Dot, { color: roleColor(e.role) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-[11px] text-black/60", children: [fmtTime(e.at), " \u00B7 ", e.role] }), _jsx("div", { className: "rounded-xl border border-black/10 bg-white p-3 text-sm whitespace-pre-wrap", children: e.content })] })] }));
    }
    if (e.type === "log") {
        return (_jsxs("div", { className: "flex gap-3", children: [_jsx(Dot, { color: "bg-amber-600" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-[11px] text-black/60", children: [fmtTime(e.at), " \u00B7 log"] }), _jsxs("div", { className: "rounded-xl border border-amber-200/60 bg-amber-50 p-3 text-sm whitespace-pre-wrap", children: [e.content, e.tags?.length ? (_jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: e.tags.map((t) => (_jsx("span", { className: "rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[11px] text-black/70", children: String(t).replace(/_/g, " ") }, t))) })) : null] })] })] }));
    }
    if (e.type === "status") {
        return (_jsxs("div", { className: "flex gap-3", children: [_jsx(Dot, { color: statusColor(e.status) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-[11px] text-black/60", children: [fmtTime(e.at), " \u00B7 status"] }), _jsx("div", { className: "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium", children: e.status.toUpperCase() })] })] }));
    }
    if (e.type === "screenshot") {
        const src = /^https?:\/\//i.test(e.url) ? e.url : `${API_BASE}${e.url}`;
        return (_jsxs("div", { className: "flex gap-3", children: [_jsx(Dot, { color: "bg-cyan-600" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-[11px] text-black/60", children: [fmtTime(e.at), " \u00B7 screenshot"] }), _jsxs("a", { href: src, target: "_blank", rel: "noreferrer", className: "block", children: [_jsx("img", { src: src, alt: e.title || "screenshot", className: "mt-1 w-full max-w-[560px] rounded-xl border border-black/10" }), _jsx("div", { className: "mt-1 text-xs text-black/60 line-clamp-1", children: e.title || e.url })] })] })] }));
    }
    return null;
}
export const ChatWindow = () => {
    const events = useSSE(`${API_BASE}/api/stream`);
    const items = useMemo(() => events, [events]); // ensure stable reference
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [items.length]);
    return (_jsxs(Card, { className: "backdrop-blur-md bg-white/70 shadow-sm", children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-lg font-semibold", children: "Live Feed" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "h-[50vh] md:h-[58vh] overflow-y-auto space-y-4 pr-2", children: [items.length === 0 ? (_jsx("div", { className: "text-sm text-black/60", children: "Waiting for events\u2026" })) : (items.map((e, i) => _jsx(Row, { e: e }, `${e.type}-${e.id ?? i}-${i}`))), _jsx("div", { ref: bottomRef })] }) })] }));
};
