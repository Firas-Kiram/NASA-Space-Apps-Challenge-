// services/publicationService.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let publications = [];
let loadedFilePath = null;

/**
 * Resolve CSV path: prefer Data/ then data/ folders, and accept an explicit filePath.
 */
function resolveCsvPath(filePath) {
  if (filePath) {
    return path.resolve(filePath);
  }

  const candidates = [
    path.join(__dirname, '..', 'Data', 'SB_publication_PMC.csv'),
    path.join(__dirname, '..', 'data', 'SB_publication_PMC.csv'),
    path.join(__dirname, 'data', 'SB_publication_PMC.csv'),
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

/**
 * Helper to check if a publication matches the filters.
 * Filters are matched case-insensitively on header names and substring-match on values.
 */
function matchesFilters(pub, filters) {
  for (const rawKey of Object.keys(filters)) {
    const filterValue = String(filters[rawKey] || '').trim();
    if (filterValue === '') continue;

    // find a column name in pub that matches filter key (case-insensitive)
    const pubKey = Object.keys(pub).find(k => k.toLowerCase() === rawKey.toLowerCase());
    if (!pubKey) {
      // no exact header match — try partial header match (contains)
      const partial = Object.keys(pub).find(k => k.toLowerCase().includes(rawKey.toLowerCase()));
      if (!partial) return false;
      // use partial as pubKey
      if (!String(pub[partial] || '').toLowerCase().includes(filterValue.toLowerCase())) return false;
    } else {
      if (!String(pub[pubKey] || '').toLowerCase().includes(filterValue.toLowerCase())) return false;
    }
  }
  return true;
}

/**
 * Get publications, optionally filtered by a map of { columnName: queryValue }.
 * @param {Object} filters - e.g. { author: 'Smith', year: '2020' }
 */
const getPublications = (filters = {}) => {
  // if no loaded data, return empty array
  if (!publications || publications.length === 0) return [];

  const filterKeys = Object.keys(filters).filter(k => String(filters[k]).trim() !== '');
  if (filterKeys.length === 0) {
    return publications;
  }

  // apply filters
  return publications.filter(pub => matchesFilters(pub, filters));
};

module.exports = {
  loadPublications,
  getPublications,
  // expose for debugging
  __internal: { publications, getLoadedFilePath: () => loadedFilePath }
};
