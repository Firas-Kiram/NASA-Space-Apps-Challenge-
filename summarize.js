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

function extractKeyPoints(text, maxPoints = 8) {
  // Split text into sections and extract key sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 80);
  const keyPoints = [];
  
  // Take representative sentences from different parts of the text
  const step = Math.max(1, Math.floor(sentences.length / maxPoints));
  for (let i = 0; i < sentences.length && keyPoints.length < maxPoints; i += step) {
    const sentence = sentences[i].trim();
    if (sentence.length > 100 ) {
      keyPoints.push(sentence);
    }
  }
  
  // Build summary from key points across all sections
  return keyPoints.join('. ') + '.';
}

function stripMarkdown(text) {
  // Remove markdown formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
    .replace(/\*(.*?)\*/g, '$1')      // Italic
    .replace(/#{1,6}\s/g, '')         // Headers
    .replace(/`(.*?)`/g, '$1')        // Code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/^\s*[-*+]\s/gm, '')     // List bullets
    .replace(/^\s*\d+\.\s/gm, '')     // Numbered lists
    .trim();
}

async function summarizeText({ title, text, model = 'qwen/qwen3-coder', apiKey = "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" }) {
  console.log(`Summarizing: ${title}`);
  console.log(`Text length: ${text.length} characters`);
  console.log(`API key present: ${!!apiKey}`);
  
  if (!apiKey) {
    // fallback: extract key points from all sections
    console.log('⚠️  No API key - extracting key points from all sections');
    return extractKeyPoints(text, 8);
  }
  try {
    const summary = await callOpenRouter({ apiKey, model, title, text });
    console.log(`✓ Summary generated (${summary.length} chars)`);
    return summary || 'No summary generated.';
  } catch (e) {
    console.error('OpenRouter error:', e.message);
    // Fallback to extractive if API fails
    console.log('⚠️  Falling back to key points extraction');
    return extractKeyPoints(text, 8);
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
