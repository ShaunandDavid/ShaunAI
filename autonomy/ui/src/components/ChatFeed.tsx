import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

export function ChatFeed({ lines }: { lines: string[] }) {
  return (
    <ScrollArea className="h-[70vh] pr-2">
      <div className="space-y-3">
        <AnimatePresence>
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`text-sm font-mono opacity-90 ${l.includes('[High]') ? 'text-rose-600 font-bold' : ''}`}
          >
            <Card key={i} className="bg-white dark:bg-white/5">
              <CardContent className="whitespace-pre-wrap">{l}</CardContent>
            </Card>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
