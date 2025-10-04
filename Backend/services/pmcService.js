// services/pmcService.js
// Uses global fetch (Node 18+). Caches results in memory.
const pmcCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function getNow() {
  return Date.now();
}

function extractPmcId(input) {
  if (!input) return null;
  // accept strings like "PMC4136787" or full URLs containing that
  const m = String(input).match(/PMC(\d+)/i);
  return m ? m[1] : null;
}

async function fetchFromEuropePmc(pmcId) {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:PMC${pmcId}&format=json&resultType=core`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Europe PMC responded ${res.status}`);
  const j = await res.json();
  const rec = j?.resultList?.result?.[0];
  if (!rec) return null;

  // authorString is usually a comma separated list; authorList may exist
  const authors = rec.authorString || (
    Array.isArray(rec.authorList?.author)
      ? rec.authorList.author.map(a => a.fullName || a.name || '').filter(Boolean).join(', ')
      : null
  );
  const citations = rec.citedByCount != null ? Number(rec.citedByCount) : null;

  return { pmcId: `PMC${pmcId}`, authors: authors || null, citations };
}

async function fetchFromNcbiEsummary(pmcId) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=${pmcId}&retmode=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NCBI esummary responded ${res.status}`);
  const j = await res.json();
  const doc = j?.result?.[pmcId];
  if (!doc) return null;

  const authors = Array.isArray(doc.authors)
    ? doc.authors.map(a => a.name || '').filter(Boolean).join(', ')
    : (doc.AuthorList || null);

  return { pmcId: `PMC${pmcId}`, authors: authors || null, citations: null };
}

/**
 * Main exported function:
 * Accepts a PMC URL or a value that contains "PMC<number>" and returns:
 * { pmcId, authors, citations }  or null if not found.
 * Caches results for TTL.
 */
async function fetchPmcMetadata(input) {
  const pmcId = extractPmcId(input);
  if (!pmcId) return null;

  // cached?
  const cached = pmcCache.get(pmcId);
  if (cached && (getNow() - cached._ts) < CACHE_TTL_MS) {
    return cached.value;
  }

  // try Europe PMC first
  try {
    const value = await fetchFromEuropePmc(pmcId);
    const wrapper = { value, _ts: getNow() };
    pmcCache.set(pmcId, wrapper);
    return value;
  } catch (e) {
    // fallback to NCBI
    try {
      const value = await fetchFromNcbiEsummary(pmcId);
      const wrapper = { value, _ts: getNow() };
      pmcCache.set(pmcId, wrapper);
      return value;
    } catch (e2) {
      // give up, cache negative result briefly
      const wrapper = { value: null, _ts: getNow() };
      pmcCache.set(pmcId, wrapper);
      return null;
    }
  }
}

module.exports = { fetchPmcMetadata };
