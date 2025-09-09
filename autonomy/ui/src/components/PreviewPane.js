import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { API_BASE, shot } from "../lib/api";
export function PreviewPane() {
    const [url, setUrl] = useState("https://level7hq.com");
    const [img, setImg] = useState(null);
    const [modal, setModal] = useState(false);
    async function doShot() {
        const r = await shot(url);
        if (r?.ok)
            setImg(`${API_BASE}${r.file}?t=${Date.now()}`);
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Preview" }) }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: url, onChange: e => setUrl(e.target.value) }), _jsx(Button, { onClick: doShot, children: "Screenshot" })] }), _jsx("div", { className: "grid grid-cols-1 gap-2", children: img ? (_jsx(motion.img, { src: img, className: "rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer", whileHover: { scale: 1.03 }, onClick: () => setModal(true) })) : (_jsx("p", { className: "text-sm opacity-70", children: "No screenshot yet." })) }), modal && img && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60", onClick: () => setModal(false), children: _jsx(motion.img, { src: img, className: "max-w-3xl max-h-[80vh] rounded-xl shadow-2xl border border-white/10", initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } }) }))] })] }));
}
