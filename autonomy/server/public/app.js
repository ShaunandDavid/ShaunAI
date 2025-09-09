// Externalized to satisfy CSP: no inline scripts/handlers

function focusInput(){
  const el = document.getElementById('input');
  if (el) el.focus();
}

const msgs = document.getElementById('msgs');
const input = document.getElementById('input');
const send = document.getElementById('send');

function ad(role, text, isError=false){
  const div = document.createElement('div');
  div.className = 'msg ' + (role==='user' ? 'u' : 'a');
  if(isError){
    div.style.background = 'rgba(255, 99, 99, .18)';
    div.style.color = '#ffdada';
    div.style.border = '1px solid rgba(255, 107, 107, .55)';
    div.style.fontWeight = '600';
  }
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function refreshSide(){
  try {
    const inbox = await fetch('/api/inbox').then(r=>r.text());
    document.getElementById('inbox').textContent = inbox || '(empty)';
  } catch { document.getElementById('inbox').textContent = '(error)'; }

  try {
    const logs = await fetch('/api/logs/tail?n=200').then(r=>r.text());
    document.getElementById('logs').textContent = logs || '(no logs)';
  } catch { document.getElementById('logs').textContent = '(error)'; }
}

async function operate(mode){
  await fetch('/api/operate',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({mode})
  });
  await refreshSide();
}

async function queueTask(){
  const line = document.getElementById('taskLine').value.trim();
  if(!line) return;
  await fetch('/api/task',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({line})
  });
  document.getElementById('taskLine').value='';
  await refreshSide();
}

async function sendMsg(){
  const text = input.value.trim();
  if(!text) return;
  ad('user', text);
  input.value='';
  try {
    const r = await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text})
    }).then(r=>r.json());
    const isError = r?.ok === false;
    ad('assistant', r?.content || '(no response)', isError);
  } catch(e){
    ad('assistant', `[UI error] ${e.message}`, true);
  }
  await refreshSide();
}

// Wire up events without inline handlers (CSP friendly)
if (send) send.addEventListener('click', sendMsg);
if (input) input.addEventListener('keydown', e=>{
  if(e.key==='Enter' && !e.shiftKey){
    e.preventDefault();
    sendMsg();
  }
});

// Header CTA buttons
const $ = (id)=>document.getElementById(id);
const bind = (id, fn)=>{ const el = $(id); if (el) el.addEventListener('click', fn); };

bind('btnStartChat', focusInput);
bind('btnFocusTask', () => $('taskLine')?.focus());

bind('btnOperateOnceTop', () => operate('once'));
bind('btnDrainQueueTop', () => operate('all'));
bind('btnSeedBaselineTop', () => operate('seed'));

bind('btnOperateOnce', () => operate('once'));
bind('btnDrainQueue', () => operate('all'));
bind('btnSeedBaseline', () => operate('seed'));
bind('btnQueueTask', queueTask);

// Initial loads
refreshSide();

// --- Status bar
async function refreshStatus(){
  try {
    const s = await fetch('/api/status').then(r=>r.json());
    if (!s?.ok) throw new Error('status not ok');
    $('s_model').textContent = `Model: ${s.model}`;
    $('s_key').textContent   = `Key: ${s.keyLoaded ? 'loaded' : 'MISSING'}`;
    $('s_inbox').textContent = `Inbox: ${s.inboxCount}`;
    $('s_art').textContent   = `Artifacts: ${s.artifactsBase || '(local only)'}`;
    $('s_key').style.color = s.keyLoaded ? '#86efac' : '#fca5a5';
  } catch (e) {
    $('s_model').textContent = 'Model: (error)';
    $('s_key').textContent   = 'Key: (error)';
    $('s_inbox').textContent = 'Inbox: (error)';
    $('s_art').textContent   = 'Artifacts: (error)';
  }
}
setInterval(refreshStatus, 3000);
refreshStatus();

// --- Live event stream (Operator-style)
try {
  const shots = $('shots');
  const es = new EventSource('/api/stream');
  es.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'log') {
        ad('assistant', msg.content || '(log)');
      } else if (msg.type === 'message') {
        const role = msg.role === 'operator' ? 'assistant' : 'assistant';
        ad(role, msg.content || '(message)');
      } else if (msg.type === 'screenshot' && msg.url) {
        const a = document.createElement('a');
        a.href = msg.url; a.target = '_blank'; a.title = msg.title || 'Screenshot';
        const img = document.createElement('img'); img.src = msg.url; img.alt = a.title;
        a.appendChild(img);
        shots.prepend(a);
        // keep only last 6
        while (shots.children.length > 6) shots.removeChild(shots.lastChild);
      }
    } catch {}
  };
} catch {}

