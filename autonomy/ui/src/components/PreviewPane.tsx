import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { API_BASE, shot } from "../lib/api";

export function PreviewPane() {
  const [url, setUrl] = useState("https://level7hq.com");
  const [img, setImg] = useState<string | null>(null);
    const [modal, setModal] = useState(false);

  async function doShot() {
    const r = await shot(url);
  if (r?.ok) setImg(`${API_BASE}${r.file}?t=${Date.now()}`);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={url} onChange={e => setUrl(e.target.value)} />
          <Button onClick={doShot}>Screenshot</Button>
        </div>
          <div className="grid grid-cols-1 gap-2">
            {img ? (
              <motion.img
                src={img}
                className="rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer"
                whileHover={{ scale: 1.03 }}
                onClick={() => setModal(true)}
              />
            ) : (
              <p className="text-sm opacity-70">No screenshot yet.</p>
            )}
          </div>
          {modal && img && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModal(false)}>
              <motion.img
                src={img}
                className="max-w-3xl max-h-[80vh] rounded-xl shadow-2xl border border-white/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              />
            </div>
          )}
      </CardContent>
    </Card>
  );
}
