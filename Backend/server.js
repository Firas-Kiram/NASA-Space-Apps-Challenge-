// server.js
const express = require('express');
const cors = require('cors');
const publicationService = require('./services/publicationService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

/**
 * GET /api/publications
 * - returns all publications
 * - supports query filters: e.g. /api/publications?author=Smith&year=2020
 * - special query `reload=true` will attempt to reload the CSV from disk
 */
app.get('/api/publications', async (req, res) => {
  try {
    const { reload, ...filters } = req.query;

    if (reload && (reload === 'true' || reload === '1')) {
      try {
        await publicationService.loadPublications();
        console.log('Publications reloaded on demand.');
      } catch (err) {
        console.error('Reload failed:', err);
        return res.status(500).json({ error: 'Failed to reload CSV', details: err.message });
      }
    }

    const data = publicationService.getPublications(filters);
    res.json({ count: data.length, data });
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
