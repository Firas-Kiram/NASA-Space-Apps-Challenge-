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
 * Get publications with only title and link fields
 * @returns {Array} Array of publications with title and link only
 */
const getPublications = () => {
  // if no loaded data, return empty array
  if (!publications || publications.length === 0) return [];

  // return only title and link fields
  return publications.map(pub => ({
    title: pub.Title || pub.title || '',
    link: pub.Link || pub.link || ''
  }));
};

module.exports = {
  loadPublications,
  getPublications,
  // expose for debugging
  __internal: { publications, getLoadedFilePath: () => loadedFilePath }
};
