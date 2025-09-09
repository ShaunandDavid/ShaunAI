export type Priority = "HIGH" | "MED" | "LOW";

export type StreamEvent =
  | { type: "message"; id: string; role: "system" | "operator" | "agent"; content: string; at: string }
  | { type: "log"; id: string; content: string; at: string; tags?: Array<"WHAT_I_DID" | "ASSUMPTIONS" | "NEXT_STEP"> }
  | { type: "screenshot"; id: string; url: string; at: string; title?: string }
  | { type: "status"; id: string; status: "started" | "completed" | "error"; at: string; meta?: Record<string, unknown> };
export type Status = {
  model: string;
  tasks: number;
  time: string; // ISO or localized string from server
};

export interface TaskPayload {
  text: string;
  priority: Priority;
  meta?: Record<string, unknown>;
}
