// Simple rate limiter for OpenAI API calls
const WINDOW = 60 * 1000; // 1 minute
const LIMIT = 60; // max requests per minute
let timestamps = [];

export function canCallOpenAI() {
  const now = Date.now();
  timestamps = timestamps.filter(ts => now - ts < WINDOW);
  if (timestamps.length < LIMIT) {
    timestamps.push(now);
    return true;
  }
  return false;
}
