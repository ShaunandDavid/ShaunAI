import { useEffect, useRef, useState } from "react";
import type { StreamEvent } from "@/types";

export function useSSE(url: string) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const ref = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(url);
    ref.current = es;

    const onMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as StreamEvent | StreamEvent[];
        setEvents((prev) => prev.concat(Array.isArray(data) ? data : [data]));
      } catch {
        /* ignore keepalives / non-JSON */
      }
    };

    es.addEventListener("message", onMessage as EventListener);

    es.onerror = () => {
      es.close();
      setTimeout(() => {
        if (ref.current === es) {
          const next = new EventSource(url);
          ref.current = next;
          next.addEventListener("message", onMessage as EventListener);
        }
      }, 1200);
    };

    return () => {
      es.removeEventListener("message", onMessage as EventListener);
      es.close();
      ref.current = null;
    };
  }, [url]);

  return events;
}
