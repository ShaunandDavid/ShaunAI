import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
export function Card({ className = "", ...props }) {
    return _jsx("div", { className: `rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm p-4 ${className}`, ...props });
}
export function CardHeader({ className = "", ...props }) {
    return _jsx("div", { className: `mb-2 flex items-center justify-between ${className}`, ...props });
}
export function CardTitle({ children }) {
    return _jsx("h3", { className: "text-lg font-semibold", children: children });
}
export function CardContent({ className = "", ...props }) {
    return _jsx("div", { className: `text-sm space-y-2 ${className}`, ...props });
}
