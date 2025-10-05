// summarize.js
// Node.js version of summarize.py using OpenRouter-compatible API
// Usage as a script:
//   node summarize.js --json Backend/Data/rag_chunks.json --title "Paper Title" --model qwen/qwen3-coder
// Or import summarizePapersByTitle in backend code.

const https = require('https');
const fs = require('fs');
const path = require('path');

const OPENROUTER_BASE = 'openrouter.ai';
const OPENROUTER_PATH = '/api/v1/chat/completions';

function loadJsonData(filePath) {
  try {
    const abs = path.resolve(filePath);
    const raw = fs.readFileSync(abs, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load JSON:', e.message);
    return [];
  }
}

function groupByTitle(data) {
  const map = new Map();
  for (const it of data) {
    const title = (it.paper_title || it.title || '').toString();
    const text = (it.text || '').toString();
    if (!title || !text) continue;
    // Use lowercase for case-insensitive comparison
    const titleKey = title.toLowerCase();
    if (!map.has(titleKey)) map.set(titleKey, []);
    map.get(titleKey).push(text);
  }
  return map;
}

function callOpenRouter({ apiKey, model, title, text }) {
  const payload = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes scientific papers concisely while preserving key details.' },
      { role: 'user', content: `Summarize the following scientific paper titled '${title}' in 3-5 sentences:\n\n${text}` }
    ],
    max_tokens: 200,
    temperature: 0.3
  });

  const options = {
    method: 'POST',
    hostname: OPENROUTER_BASE,
    path: OPENROUTER_PATH,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`OpenRouter HTTP ${res.statusCode}: ${data}`));
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content || '';
          resolve(content || '');
        } catch (e) {
          reject(new Error('Invalid OpenRouter response'));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function summarizeText({ title, text, model = 'qwen/qwen3-coder', apiKey = process.env.OPENROUTER_API_KEY }) {
  if (!apiKey) {
    // fallback: return truncated preview
    return `Summary (local fallback): ${text.slice(0, 1500)}...`;
  }
  try {
    const summary = await callOpenRouter({ apiKey, model, title, text });
    return summary || 'No summary generated.';
  } catch (e) {
    return `Error summarizing '${title}': ${e.message}`;
  }
}

async function summarizePapersByTitle({ titles, jsonFilePath, model = 'qwen/qwen3-coder', apiKey = process.env.OPENROUTER_API_KEY }) {
  const data = loadJsonData(jsonFilePath);
  const groups = groupByTitle(data);
  const results = [];
  for (const rawTitle of titles) {
    const title = String(rawTitle);
    // Use lowercase for case-insensitive lookup
    const titleKey = title.toLowerCase();
    const sections = groups.get(titleKey) || [];
    if (sections.length === 0) {
      results.push({ title, summary: `No data found for '${title}' in the JSON file.` });
      continue;
    }
    const fullText = sections.join('\n\n');
    const summary = await summarizeText({ title, text: fullText, model, apiKey });
    results.push({ title, summary });
  }
  return results;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name, def = undefined) => {
    const idx = args.findIndex(a => a === name);
    if (idx !== -1 && args[idx + 1]) return args[idx + 1];
    return def;
  };
  const json = getArg('--json', 'Backend/Data/rag_chunks.json');
  const title = getArg('--title');
  const model = getArg('--model', 'qwen/qwen3-coder');

  if (!title) {
    console.error('Usage: node summarize.js --json <file> --title "Paper Title" [--model modelName]');
    process.exit(1);
  }

  summarizePapersByTitle({ titles: [title], jsonFilePath: json, model })
    .then(results => {
      results.forEach(r => {
        console.log(`**${r.title}**\n${r.summary}\n`);
      });
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { summarizeText, summarizePapersByTitle };
