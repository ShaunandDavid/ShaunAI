import { useEffect, useRef, useState } from "react";
export function useSSE(url) {
    const [events, setEvents] = useState([]);
    const ref = useRef(null);
    useEffect(() => {
        const es = new EventSource(url);
        ref.current = es;
        const onMessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setEvents((prev) => prev.concat(Array.isArray(data) ? data : [data]));
            }
            catch {
                /* ignore keepalives / non-JSON */
            }
        };
        es.addEventListener("message", onMessage);
        es.onerror = () => {
            es.close();
            setTimeout(() => {
                if (ref.current === es) {
                    const next = new EventSource(url);
                    ref.current = next;
                    next.addEventListener("message", onMessage);
                }
            }, 1200);
        };
        return () => {
            es.removeEventListener("message", onMessage);
            es.close();
            ref.current = null;
        };
    }, [url]);
    return events;
}
