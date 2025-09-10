import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
export function ScrollArea({ className = "", children }) {
    return _jsx("div", { className: `overflow-y-auto ${className}`, style: { maxHeight: "70vh" }, children: children });
}
