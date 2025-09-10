import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
export const Input = React.forwardRef(({ className = "", ...props }, ref) => (_jsx("input", { ref: ref, className: `w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white/70 dark:bg-white/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-black/20 dark:ring-white/20 ${className}`, ...props })));
Input.displayName = "Input";
