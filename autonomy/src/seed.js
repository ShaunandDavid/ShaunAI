import { read, write, p } from "./fsx.js";

export async function seedDaily() {
  const inbox = p("tasks", "inbox.md");
  const txt = (read(inbox) || "");
  const toAdd = [];
  if (!/Generate daily R3 post/i.test(txt)) toAdd.push("[High] Generate daily R3 post");
  if (!/Draft 10 outreach messages/i.test(txt)) toAdd.push("[High] Draft 10 outreach messages");
  const next = (txt ? txt.trim() + "\n" : "") + toAdd.join("\n") + (toAdd.length ? "\n" : "");
  write(inbox, next);
  return toAdd.length;
}
