// server.js
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const publicationService = require('./services/publicationService');

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

/**
 * GET /api/publications
 * - returns all publications with title, link, and keywords
 * - loads data from papers_keywords1.csv file
 */
app.get('/api/publications', async (req, res) => {
  try {
    const data = publicationService.getPublications();
    res.json(data);
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

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`PDF already exists: ${filename}`);
      return res.json({ 
        success: true, 
        localPath: `/pdfs/${filename}`,
        cached: true
      });
    }

    // Construct PDF URL
    const pdfUrl = url.endsWith('/pdf') ? url : `${url}/pdf`;
    console.log(`Downloading PDF: ${pdfUrl}`);

    // Download the PDF
    https.get(pdfUrl, (response) => {
      if (response.statusCode !== 200) {
        console.error(`Failed to download PDF: ${response.statusCode}`);
        return res.status(response.statusCode).json({ 
          error: 'Failed to download PDF from PMC',
          statusCode: response.statusCode
        });
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`PDF downloaded successfully: ${filename}`);
        res.json({ 
          success: true, 
          localPath: `/pdfs/${filename}`,
          cached: false
        });
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {});
        console.error('File write error:', err);
        res.status(500).json({ error: 'Failed to save PDF' });
      });
    }).on('error', (err) => {
      console.error('Download error:', err);
      res.status(500).json({ error: 'Failed to download PDF' });
    });

  } catch (err) {
    console.error('PDF download error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Serve PDF files from local storage
 */
app.use('/pdfs', express.static(PDF_DIR));

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
    .then(() => console.log('Initial CSV load complete.'))
    .catch(err => {
      console.error('Initial CSV load failed:', err.message);
      console.error('Make sure file exists in Data/ or data/ folder and is named papers_keywords1.csv');
    });
});
