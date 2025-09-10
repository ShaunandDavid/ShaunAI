import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { setTask, runOne, runDrain, seedDaily } from "../lib/api";
export function Sidebar({ onRefresh }) {
    const [line, setLine] = useState("[High] Check site https://level7hq.com and screenshot");
    return (_jsxs(Card, { className: "space-y-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Queue Control" }) }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(Input, { value: line, onChange: e => setLine(e.target.value) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: async () => { await setTask(line); onRefresh(); }, children: "Add" }), _jsx(Button, { variant: "secondary", onClick: () => setLine("[High] Generate daily R3 post"), children: "+R3" }), _jsx(Button, { variant: "secondary", onClick: () => setLine("[Med] Draft 10 outreach messages"), children: "+Outreach" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: async () => { await runOne(); onRefresh(); }, children: "Run One" }), _jsx(Button, { onClick: async () => { await runDrain(); onRefresh(); }, children: "Drain" }), _jsx(Button, { variant: "ghost", onClick: async () => { await seedDaily(); onRefresh(); }, children: "Seed 9:00" })] })] })] }));
}
