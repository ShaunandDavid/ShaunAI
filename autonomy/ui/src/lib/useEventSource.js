import { useEffect, useRef, useState } from 'react';
export function useEventSource(url) {
    const [events, setEvents] = useState([]);
    const esRef = useRef(null);
    useEffect(() => {
        let es = new EventSource(url);
        esRef.current = es;
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setEvents((prev) => prev.concat(Array.isArray(data) ? data : [data]));
            }
            catch { /* ignore non-JSON keepalives */ }
        };
        es.onerror = () => {
            es.close();
            // simple reconnect after 1.5s
            setTimeout(() => {
                if (esRef.current === es) {
                    es = new EventSource(url);
                    esRef.current = es;
                }
            }, 1500);
        };
        return () => {
            es.close();
            esRef.current = null;
        };
    }, [url]);
    return { events, setEvents };
}
