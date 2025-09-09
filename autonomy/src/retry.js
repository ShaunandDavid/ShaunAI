export async function withRetry(fn, tries=5) {
  let err; for (let i=0;i<tries;i++){ try { return await fn(); } 
  catch (e){ err=e; await new Promise(r=>setTimeout(r, 2**i*400)); } }
  throw err;
}
