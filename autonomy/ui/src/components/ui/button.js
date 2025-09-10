import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ className = "", variant = "default", ...props }) {
    const base = "px-4 py-2 rounded-xl text-sm font-medium transition border";
    const v = variant === "secondary"
        ? "bg-white text-black border-gray-300 hover:bg-gray-100"
        : variant === "ghost"
            ? "bg-transparent text-inherit border-transparent hover:bg-gray-100/10"
            : "bg-black text-white border-black hover:opacity-90 dark:bg-white dark:text-black dark:border-white";
    return _jsx("button", { className: `${base} ${v} ${className} hover:scale-[1.02] transition-transform`, ...props });
}
