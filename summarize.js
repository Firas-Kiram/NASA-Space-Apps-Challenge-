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
  // Limit text to avoid token limits (approximately 12000 characters = ~3000 tokens)
  const truncatedText = text.length > 12000 ? text.slice(0, 12000) + '...' : text;
  
  const payload = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes scientific papers concisely while preserving key details.' },
      { role: 'user', content: `Summarize the following scientific paper titled '${title}' , covering the main objectives, methods, results, and conclusions:\n\n${truncatedText}` }
    ],
    max_tokens: 400,
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
        console.log(`OpenRouter response status: ${res.statusCode}`);
        if (res.statusCode && res.statusCode >= 400) {
          console.error(`OpenRouter error: ${data}`);
          return reject(new Error(`OpenRouter HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content || '';
          console.log(`OpenRouter returned ${content.length} chars`);
          resolve(content || '');
        } catch (e) {
          console.error('Failed to parse OpenRouter response:', e.message);
          reject(new Error('Invalid OpenRouter response'));
        }
      });
    });
    req.on('error', (e) => {
      console.error('OpenRouter request error:', e.message);
      reject(e);
    });
    req.write(payload);
    req.end();
  });
}

function stripAbstractSection(text) {
  // Remove the abstract section if present to avoid echoing it
  try {
    const lower = text.toLowerCase();
    const abstractIdx = lower.indexOf('abstract');
    if (abstractIdx === -1) return text;
    // Look for the next common heading after abstract
    const nextHeadings = ['introduction', 'background', 'methods', 'materials and methods', 'results'];
    let nextIdx = -1;
    for (const h of nextHeadings) {
      const idx = lower.indexOf(h, abstractIdx + 8);
      if (idx !== -1 && (nextIdx === -1 || idx < nextIdx)) nextIdx = idx;
    }
    if (nextIdx !== -1) {
      return text.slice(nextIdx); // drop everything up to the next section
    }
    // If no next heading, drop first ~1500 chars as a rough abstract cap
    return text.slice(Math.min(text.length, 1500));
  } catch {
    return text;
  }
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9\(\[])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function dedupeBySimilarity(sentences, threshold = 0.8) {
  const result = [];
  const jaccard = (a, b) => {
    const sa = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const sb = new Set(b.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const inter = new Set([...sa].filter(x => sb.has(x))).size;
    const union = new Set([...sa, ...sb]).size;
    return union === 0 ? 0 : inter / union;
  };
  for (const s of sentences) {
    if (!result.some(r => jaccard(r, s) >= threshold)) result.push(s);
  }
  return result;
}

function extractKeyPoints(text, maxPoints = 6) {
  // Prefer sentences beyond abstract; pick across the text to cover sections
  const cleaned = stripAbstractSection(text);
  const sentences = splitSentences(cleaned).filter(s => s.length >= 60 && s.length <= 300);
  if (sentences.length === 0) return '';

  // Sample evenly across the document
  const keyPoints = [];
  const step = Math.max(1, Math.floor(sentences.length / (maxPoints + 1)));
  for (let i = step; i < sentences.length && keyPoints.length < maxPoints; i += step) {
    keyPoints.push(sentences[i]);
  }
  const deduped = dedupeBySimilarity(keyPoints, 0.75).slice(0, maxPoints);
  return deduped.join(' ');
}


async function summarizeText({ title, text, model = 'qwen/qwen3-coder', apiKey = process.env.OPENROUTER_API_KEY }) {
  console.log(`Summarizing: ${title}`);
  console.log(`Text length: ${text.length} characters`);
  console.log(`API key present: ${!!apiKey}`);
  
  if (!apiKey) {
    // fallback: extract key points from all sections
    console.log('⚠️  No API key - extracting key points (abstract removed)');
    const summary = extractKeyPoints(text, 6);
    return summary || 'Summary unavailable.';
  }
  try {
    const summary = await callOpenRouter({ apiKey, model, title, text });
    console.log(`✓ Summary generated (${summary.length} chars)`);
    if (summary && summary.trim().length > 0) return summary;
    // Rare empty LLM response: fallback
    const fallback = extractKeyPoints(text, 6);
    return fallback || 'Summary unavailable.';
  } catch (e) {
    console.error('OpenRouter error:', e.message);
    // Fallback to extractive if API fails
    console.log('⚠️  Falling back to key points extraction (abstract removed)');
    const fallback = extractKeyPoints(text, 6);
    return fallback || 'Summary unavailable.';
  }
}

async function summarizePapersByTitle({ titles, jsonFilePath, model = 'qwen/qwen3-coder', apiKey = process.env.OPENROUTER_API_KEY }) {
  const data = loadJsonData(jsonFilePath);
  console.log(`Loaded ${data.length} chunks from JSON`);
  
  const groups = groupByTitle(data);
  console.log(`Grouped into ${groups.size} unique papers`);
  
  const results = [];
  for (const rawTitle of titles) {
    const title = String(rawTitle);
    // Use lowercase for case-insensitive lookup
    const titleKey = title.toLowerCase();
    const sections = groups.get(titleKey) || [];
    
    console.log(`Found ${sections.length} sections for "${title}"`);
    
    if (sections.length === 0) {
      results.push({ title, summary: `No data found for '${title}' in the JSON file.` });
      continue;
    }
    
    const fullText = sections.join('\n\n');
    console.log(`Combined text length: ${fullText.length} characters from ${sections.length} sections`);
    
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
