// server.js
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const publicationService = require('./services/publicationService');
const { summarizePapersByTitle } = require('../summarize');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create PDF storage directory
const PDF_DIR = path.join(__dirname, 'pdfs');
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
  console.log('Created PDF storage directory:', PDF_DIR);
}

app.get('/health', (req, res) => res.json({ ok: true }));

// Citations index loaded from papers_with_citations.csv (one-time at startup)
const citationsIndex = {
  byUrl: new Map(),
  byPmcId: new Map(),
  byTitle: new Map()
};

function resolveCitationsCsvPath(filePath) {
  if (filePath) return path.resolve(filePath);
  const candidates = [
    path.join(__dirname, '..', 'papers_with_citations.csv'),
    path.join(__dirname, 'Data', 'papers_with_citations.csv'),
    path.join(__dirname, 'data', 'papers_with_citations.csv'),
    path.join(__dirname, '..', '..', 'papers_with_citations.csv')
  ];
  return candidates.find(p => fs.existsSync(p)) || candidates[0];
}

function loadCitationsOnce(filePath) {
  return new Promise((resolve) => {
    const csvPath = resolveCitationsCsvPath(filePath);
    if (!csvPath || !fs.existsSync(csvPath)) {
      console.warn('Citations CSV not found. Proceeding without citations.');
      return resolve();
    }
    citationsIndex.byUrl.clear();
    citationsIndex.byPmcId.clear();
    citationsIndex.byTitle.clear();

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const title = String(row.title || row.Title || '').trim();
          const url = String(row.url || row.link || row.Link || '').trim();
          const citationsRaw = row.citations != null ? String(row.citations).trim() : '';
          const val = parseFloat(citationsRaw);
          if (Number.isNaN(val)) return;
          if (url) {
            const norm = url.replace(/\/$/, '').toLowerCase();
            citationsIndex.byUrl.set(norm, val);
            const pmc = norm.match(/PMC\d+/i);
            if (pmc) citationsIndex.byPmcId.set(pmc[0].toUpperCase(), val);
          }
          if (title) citationsIndex.byTitle.set(title.toLowerCase(), val);
        } catch {}
      })
      .on('end', () => {
        console.log(`Citations loaded — url=${citationsIndex.byUrl.size}, pmc=${citationsIndex.byPmcId.size}, title=${citationsIndex.byTitle.size}`);
        resolve();
      })
      .on('error', () => resolve());
  });
}

function lookupCitations(pub) {
  const rawUrl = (pub.link || '').trim();
  if (rawUrl) {
    const norm = rawUrl.replace(/\/$/, '').toLowerCase();
    const viaUrl = citationsIndex.byUrl.get(norm);
    if (typeof viaUrl === 'number' && !Number.isNaN(viaUrl)) return viaUrl;
    try {
      const u = new URL(norm);
      const base = `${u.origin}${u.pathname}`.replace(/\/$/, '').toLowerCase();
      const viaBase = citationsIndex.byUrl.get(base);
      if (typeof viaBase === 'number' && !Number.isNaN(viaBase)) return viaBase;
    } catch {}
    const pmc = norm.match(/PMC\d+/i);
    if (pmc) {
      const viaPmc = citationsIndex.byPmcId.get(pmc[0].toUpperCase());
      if (typeof viaPmc === 'number' && !Number.isNaN(viaPmc)) return viaPmc;
    }
  }
  const title = (pub.title || '').trim().toLowerCase();
  if (title) {
    const viaTitle = citationsIndex.byTitle.get(title);
    if (typeof viaTitle === 'number' && !Number.isNaN(viaTitle)) return viaTitle;
  }
  return undefined;
}

/**
 * GET /api/publications
 * - returns all publications with title, link, keywords, date, and authors
 * - loads data from papers_keywords0.csv (preferred) or papers_keywords2.csv (fallback to papers_keywords1.csv)
 */
app.get('/api/publications', async (req, res) => {
  try {
    const data = publicationService.getPublications();
    const merged = data.map(p => {
      const citations = lookupCitations(p);
      return citations != null ? { ...p, citations } : { ...p };
    });
    res.json(merged);
  } catch (err) {
    console.error('GET /api/publications error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/keywords
 * - returns all unique keywords from publications
 */
app.get('/api/keywords', async (req, res) => {
  try {
    const keywords = publicationService.getUniqueKeywords();
    res.json(keywords);
  } catch (err) {
    console.error('GET /api/keywords error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/publications/by-year
 * - aggregates publication counts by year using publication date
 */
app.get('/api/publications/by-year', async (req, res) => {
  try {
    const pubs = publicationService.getPublications();
    const counts = {};
    for (const p of pubs) {
      const dateStr = (p.date || '').toString();
      const m = dateStr.match(/\b(19|20)\d{2}\b/);
      const year = m ? m[0] : null;
      if (!year) continue;
      counts[year] = (counts[year] || 0) + 1;
    }
    const result = Object.entries(counts)
      .map(([year, count]) => ({ year: parseInt(year, 10), count }))
      .sort((a, b) => a.year - b.year);
    res.json(result);
  } catch (err) {
    console.error('GET /api/publications/by-year error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/publications/by-keywords
 * Query params:
 *  - keywords: comma/semicolon/pipe separated list of keywords
 *  - mode: 'any' (default) or 'all' for matching
 */
app.get('/api/publications/by-keywords', async (req, res) => {
  try {
    const raw = (req.query.keywords || '').toString();
    const mode = (req.query.mode || 'any').toString();
    const list = raw
      .split(/[;,|]/)
      .map(k => k.trim())
      .filter(Boolean);

    if (list.length === 0) {
      return res.json(publicationService.getPublications());
    }

    // Use service matcher if present; otherwise simple filter
    const svc = publicationService;
    const results = (svc.getPublicationsByKeywords
      ? svc.getPublicationsByKeywords(list, mode)
      : svc.getPublications().filter(pub => {
          const pubKeywords = (pub.keywords || '').split(/[;,|]/).map(k => k.trim().toLowerCase()).filter(Boolean);
          if (pubKeywords.length === 0) return false;
          const targets = list.map(k => k.toLowerCase());
          if (mode === 'all') {
            return targets.every(k => pubKeywords.includes(k));
          }
          return targets.some(k => pubKeywords.includes(k));
        }));

    res.json(results);
  } catch (err) {
    console.error('GET /api/publications/by-keywords error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/download-pdf
 * Downloads PDF from PMC and saves it locally, then returns the local path
 */
// Helper: follow redirects and stream to file
function downloadWithRedirects(targetUrl, filePath, depth = 0, maxRedirects = 5, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    if (depth > maxRedirects) {
      return reject(new Error('Too many redirects'));
    }

    const client = targetUrl.startsWith('https') ? https : http;
    const req = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*;q=0.8',
        'Referer': 'https://www.ncbi.nlm.nih.gov/',
        'Accept-Language': 'en-US,en;q=0.9',
        ...extraHeaders
      }
    }, (response) => {
      // Handle redirects
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        const location = response.headers.location;
        if (!location) {
          return reject(new Error(`Redirect without location header from ${targetUrl}`));
        }
        // Resolve relative redirects
        const nextUrl = new URL(location, targetUrl).toString();
        response.resume(); // discard data
        return resolve(downloadWithRedirects(nextUrl, filePath, depth + 1, maxRedirects, extraHeaders));
      }

      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`HTTP ${response.statusCode} from ${targetUrl}`));
      }

      const out = fs.createWriteStream(filePath);
      response.pipe(out);
      out.on('finish', () => {
        out.close(() => resolve());
      });
      out.on('error', (err) => {
        out.close(() => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(30000, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

// Fetch HTML/text with redirects
function fetchTextWithRedirects(targetUrl, depth = 0, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (depth > maxRedirects) return reject(new Error('Too many redirects'));
    const client = targetUrl.startsWith('https') ? https : http;
    const req = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.ncbi.nlm.nih.gov/'
      }
    }, (response) => {
      if ([301,302,303,307,308].includes(response.statusCode)) {
        const location = response.headers.location;
        if (!location) return reject(new Error(`Redirect without location from ${targetUrl}`));
        const nextUrl = new URL(location, targetUrl).toString();
        response.resume();
        return resolve(fetchTextWithRedirects(nextUrl, depth + 1, maxRedirects));
      }
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`HTTP ${response.statusCode} from ${targetUrl}`));
      }
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('Request timeout')));
  });
}

app.get('/api/download-pdf', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Extract PMC ID from URL
    const pmcMatch = url.match(/PMC\d+/);
    if (!pmcMatch) {
      return res.status(400).json({ error: 'Invalid PMC URL' });
    }
    
    const pmcId = pmcMatch[0];
    const filename = `${pmcId}.pdf`;
    const filePath = path.join(PDF_DIR, filename);

    // Helper to check if a file is a valid PDF by magic number
    const isPdfFile = (p) => {
      try {
        const fd = fs.openSync(p, 'r');
        const buf = Buffer.alloc(5);
        fs.readSync(fd, buf, 0, 5, 0);
        fs.closeSync(fd);
        return buf.toString() === '%PDF-';
      } catch {
        return false;
      }
    };

    // Check if file already exists and is valid PDF
    if (fs.existsSync(filePath) && isPdfFile(filePath)) {
      console.log(`PDF already exists: ${filename}`);
      return res.json({ success: true, localPath: `/pdfs/${filename}`, cached: true });
    } else if (fs.existsSync(filePath)) {
      // Remove invalid previous file
      try { fs.unlinkSync(filePath); } catch {}
    }

    // Construct PDF URL (PMC supports /pdf path that redirects to actual file)
    // Build candidate URLs for PMC PDF
    const candidates = [
      // PMC OA PDF service (most reliable)
      `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/pdf/${pmcId}.pdf`,
      // Alternative PMC host
      `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/pdf/${pmcId}.pdf`,
      // User-provided URL variants
      url.endsWith('/pdf') ? url : `${url.replace(/\/$/, '')}/pdf`,
      `${url.replace(/\/$/, '')}/pdf/${pmcId}.pdf`
    ];

    let downloaded = false;
    const tmpPath = `${filePath}.tmp`;
    for (const cand of candidates) {
      try {
        console.log(`Attempting PDF download: ${cand}`);
        // Ensure previous temp is removed
        try { fs.unlinkSync(tmpPath); } catch {}
        const headers = {};
        // Some PDFs require Origin/Host alignment
        try {
          const u = new URL(cand);
          headers['Host'] = u.host;
          headers['Origin'] = `${u.protocol}//${u.host}`;
        } catch {}
        await downloadWithRedirects(cand, tmpPath, 0, 5, headers);
        if (isPdfFile(tmpPath)) {
          fs.renameSync(tmpPath, filePath);
          downloaded = true;
          console.log(`PDF downloaded successfully from: ${cand}`);
          break;
        } else {
          // Not a PDF; cleanup and try next
          try { fs.unlinkSync(tmpPath); } catch {}
        }
      } catch (e) {
        console.warn(`Download attempt failed for ${cand}: ${e.message}`);
        try { fs.unlinkSync(tmpPath); } catch {}
      }
    }

    if (!downloaded) {
      // Fallback: fetch article HTML and parse real PDF filename
      const articleCandidates = [
        `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/`,
        `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/`,
      ];
      for (const articleUrl of articleCandidates) {
        try {
          console.log(`Fetching article HTML to resolve PDF: ${articleUrl}`);
          const html = await fetchTextWithRedirects(articleUrl);
          const matches = Array.from(html.matchAll(/\"(\/pmc\/articles\/${pmcId}\/pdf\/[^\"]+\.pdf)\"/g));
          const uniquePaths = [...new Set(matches.map(m => m[1]))];
          for (const p of uniquePaths) {
            const abs = `https://www.ncbi.nlm.nih.gov${p}`;
            console.log(`Attempting resolved PDF: ${abs}`);
            try { fs.unlinkSync(tmpPath); } catch {}
            await downloadWithRedirects(abs, tmpPath);
            if (isPdfFile(tmpPath)) {
              fs.renameSync(tmpPath, filePath);
              downloaded = true;
              break;
            } else {
              try { fs.unlinkSync(tmpPath); } catch {}
            }
          }
          if (downloaded) break;
        } catch (e) {
          console.warn(`Failed resolving from HTML: ${e.message}`);
        }
      }
      if (!downloaded) {
        return res.status(502).json({ error: 'Failed to download PDF from external source' });
      }
    }

    return res.json({ success: true, localPath: `/pdfs/${filename}`, cached: false });

  } catch (err) {
    console.error('PDF download error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Serve PDF files from local storage
 */
app.use('/pdfs', express.static(PDF_DIR));

/**
 * POST /api/summarize
 * Generate AI summary for a paper by title
 * Body: { title: "Paper Title" }
 * Returns: { title, summary }
 */
app.post('/api/summarize', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Path to rag_chunks.json
    const ragChunksPath = path.join(__dirname, 'Data', 'rag_chunks.json');
    
    // Check if file exists
    if (!fs.existsSync(ragChunksPath)) {
      return res.status(404).json({ error: 'RAG chunks data not found' });
    }

    console.log(`Generating summary for: ${title}`);
    
    // Call summarize function with the title
    const results = await summarizePapersByTitle({
      titles: [title],
      jsonFilePath: ragChunksPath,
      model: 'qwen/qwen3-coder',
      apiKey: process.env.OPENROUTER_API_KEY
    });

    if (results && results.length > 0) {
      res.json(results[0]); // Return { title, summary }
    } else {
      res.status(404).json({ error: 'No summary generated' });
    }
  } catch (err) {
    console.error('Summarization error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate summary' });
  }
});

// global error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server immediately, then attempt load (so API returns 503/empty rather than never starting)
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  // initial load (non-blocking)
  publicationService.loadPublications()
    .then(() => loadCitationsOnce())
    .then(() => console.log('Initial CSV load complete.'))
    .catch(err => {
      console.error('Initial CSV load failed:', err.message);
      console.error('Ensure dataset CSV exists: papers_keywords2.csv or papers_keywords0.csv (fallback: papers_keywords1.csv) in project root or Backend/Data|data');
    });
});
