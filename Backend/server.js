// server.js
const express = require('express');
const cors = require('cors');
const publicationService = require('./services/publicationService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

/**
 * GET /api/publications
 * - returns all publications with title and link only
 * - simple endpoint that loads data from CSV file
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
      console.error('Make sure file exists in Data/ or data/ folder and is named SB_publication_PMC.csv');
    });
});
