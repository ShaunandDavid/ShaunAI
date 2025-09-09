import { jsx as _jsx } from "react/jsx-runtime";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
export function ChatFeed({ lines }) {
    return (_jsx(ScrollArea, { className: "h-[70vh] pr-2", children: _jsx("div", { className: "space-y-3", children: _jsx(AnimatePresence, { children: lines.map((l, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.3, ease: "easeOut" }, className: `text-sm font-mono opacity-90 ${l.includes('[High]') ? 'text-rose-600 font-bold' : ''}`, children: _jsx(Card, { className: "bg-white dark:bg-white/5", children: _jsx(CardContent, { className: "whitespace-pre-wrap", children: l }) }, i) }, i))) }) }) }));
}
