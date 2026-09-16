const fs = require('fs');
const path = require('path');

function keyCandidates() {
  const list = [];
  if (process.env.OPTIDZ_CLAUDE_KEY_FILE) list.push(process.env.OPTIDZ_CLAUDE_KEY_FILE);
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) return list;
  list.push(path.join(__dirname, 'claude.key'));
  try {
    const { app } = require('electron');
    if (app) list.unshift(path.join(app.getPath('userData'), 'claude.key'));
  } catch {}
  return list;
}

function readKey() {
  const env = String(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '').trim();
  if (env) return env;
  for (const file of keyCandidates()) {
    try {
      const line = fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.trim()).find((l) => l && !l.startsWith('#'));
      if (line) return line;
    } catch {}
  }
  return '';
}

async function chat({ system, messages, model, max_tokens }) {
  const apiKey = readKey();
  if (!apiKey) throw new Error('Assistant photo indisponible sur ce poste.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-5',
      max_tokens: max_tokens || 2048,
      system: system || '',
      messages: messages || []
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Erreur Claude ' + res.status);
  return (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
}

module.exports = { readKey, chat };
