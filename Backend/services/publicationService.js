// services/publicationService.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let publications = [];
let loadedFilePath = null;


function resolveCsvPath(filePath) {
  if (filePath) {
    return path.resolve(filePath);
  }

  const candidates = [
    // Prefer v0 dataset first (has publication_date and authors)
    path.join(__dirname, '..', '..', 'papers_keywords0.csv'),
    path.join(__dirname, '..', 'Data', 'papers_keywords0.csv'),
    path.join(__dirname, '..', 'data', 'papers_keywords0.csv'),
    // Then v2 dataset
    path.join(__dirname, '..', '..', 'papers_keywords2.csv'),
    path.join(__dirname, '..', 'Data', 'papers_keywords2.csv'),
    path.join(__dirname, '..', 'data', 'papers_keywords2.csv'),
    path.join(__dirname, 'data', 'papers_keywords2.csv'),
    // Fallback to v1
    path.join(__dirname, '..', '..', 'papers_keywords1.csv'),
    path.join(__dirname, '..', 'Data', 'papers_keywords1.csv'),
    path.join(__dirname, '..', 'data', 'papers_keywords1.csv'),
    path.join(__dirname, 'data', 'papers_keywords1.csv'),
  ];


  
  return candidates.find(p => fs.existsSync(p)) || candidates[0];
}

/**
 * Load publications into memory (overwrites previous).
 * @param {string} [filePath] - optional CSV path to use
 * @returns {Promise<void>}
 */
const loadPublications = (filePath) => {
  return new Promise((resolve, reject) => {
    publications = []; // reset
    const csvPath = resolveCsvPath(filePath);
    loadedFilePath = csvPath;

    if (!fs.existsSync(csvPath)) {
      return reject(new Error(`CSV file not found at ${csvPath}`));
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // trim keys and values to reduce surprising whitespace issues
        const cleaned = {};
        Object.keys(row).forEach(k => {
          const newKey = (k || '').trim();
          const value = row[k] == null ? '' : String(row[k]).trim();
          cleaned[newKey] = value;
        });
        publications.push(cleaned);
      })
      .on('end', () => {
        console.log(`CSV loaded: ${csvPath} — ${publications.length} records`);
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

// Helper: parse a publication record's keywords into an array (supports v2 delimiters)
function parseKeywordsFromPublication(pub) {
  const raw = (pub.keywords || pub.Keywords || '').trim();
  if (!raw) return [];
  return raw
    .split(/[;,|]/)
    .map(k => k.trim())
    .filter(k => k.length > 0);
}


/**
 * Get publications with title, link (url), keywords, date, and authors fields
 * - date is sourced from CSV columns: publication_date | date | Date (if present)
 * - authors is sourced from CSV columns: authors | Authors (if present)
 * @returns {Array} Array of publications with title, link, keywords, date, authors
 */
const getPublications = () => {
  // if no loaded data, return empty array
  if (!publications || publications.length === 0) return [];

  // return title, link (url), and keywords fields
  return publications.map(pub => ({
    title: pub.title || pub.Title || '',
    link: pub.url || pub.link || pub.Link || '',
    keywords: pub.keywords || pub.Keywords || '',
    date: pub.publication_date || pub.date || pub.Date || '',
    authors: pub.authors || pub.Authors || ''
  }));
};

/**
 * Get all unique keywords from publications
 * @returns {Array} Array of unique keywords sorted alphabetically
 */
const getUniqueKeywords = () => {
  if (!publications || publications.length === 0) return [];

  const keywordsSet = new Set();
  
  publications.forEach(pub => {
    parseKeywordsFromPublication(pub).forEach(kw => keywordsSet.add(kw));
  });

  // Convert to array and sort alphabetically
  return Array.from(keywordsSet).sort((a, b) => a.localeCompare(b));
};

module.exports = {
  loadPublications,
  getPublications,
  getUniqueKeywords,
  // expose for debugging
  __internal: { publications, getLoadedFilePath: () => loadedFilePath }
};
