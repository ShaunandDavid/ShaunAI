import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { setTask, runOne, runDrain, seedDaily } from "../lib/api";

export function Sidebar({ onRefresh }: { onRefresh: () => void }) {
  const [line, setLine] = useState("[High] Check site https://level7hq.com and screenshot");
  return (
    <Card className="space-y-2">
      <CardHeader><CardTitle>Queue Control</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={line} onChange={e => setLine(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={async () => { await setTask(line); onRefresh(); }}>Add</Button>
          <Button variant="secondary" onClick={() => setLine("[High] Generate daily R3 post")}>+R3</Button>
          <Button variant="secondary" onClick={() => setLine("[Med] Draft 10 outreach messages")}>+Outreach</Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={async () => { await runOne(); onRefresh(); }}>Run One</Button>
          <Button onClick={async () => { await runDrain(); onRefresh(); }}>Drain</Button>
          <Button variant="ghost" onClick={async () => { await seedDaily(); onRefresh(); }}>Seed 9:00</Button>
        </div>
      </CardContent>
    </Card>
  );
}
