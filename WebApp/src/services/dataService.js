// Data service for transforming API data into frontend format
import apiService from './apiService';

class DataService {
  constructor() {
    this.publications = [];
    this.isLoaded = false;
  }

  async loadPublications() {
    if (this.isLoaded) {
      return this.publications;
    }

    try {
      const data = await apiService.fetchPublications();
      this.publications = data;
      this.isLoaded = true;
      return this.publications;
    } catch (error) {
      console.error('Failed to load publications:', error);
      return [];
    }
  }

  // Transform API data to match the expected frontend format
  transformPublicationsForSearch(publications) {
    return publications.map((pub, index) => ({
      pub_id: `PUB${String(index + 1).padStart(3, '0')}`,
      title: pub.title,
      year: this.extractYearFromDate(pub.date) || this.extractYearFromTitle(pub.title),
      tags: this.extractKeywordsAsTags(pub.keywords), // Use keywords from API as tags
      organism: this.detectOrganism(pub.title),
      platform: this.detectPlatform(pub.title),
      summary: this.generateSummary(pub.title),
      extendedSummary: this.generateExtendedSummary(pub.title),
      confidence: this.calculateConfidence(pub.title),
      citations: (typeof pub.citations === 'number' && !Number.isNaN(pub.citations))
        ? pub.citations
        : this.estimateCitations(pub.title),
      authors: this.parseAuthorsString(pub.authors),
      journal: this.extractJournal(pub.title),
      link: pub.link,
      keywords: pub.keywords, // Keep original keywords string
      date: pub.date || ''
    }));
  }

  // Helper methods for data transformation
  extractKeywordsAsTags(keywords) {
    // Parse keywords string into array of tags
    if (!keywords || keywords.trim() === '') {
      return ['Space Research'];
    }
    
    // Split by comma and clean up
    const keywordArray = keywords
      .split(',')
      .map(kw => kw.trim())
      .filter(kw => kw.length > 0)
      .slice(0, 10); // Limit to first 10 keywords for display
    
    return keywordArray.length > 0 ? keywordArray : ['Space Research'];
  }

  extractYearFromTitle(title) {
    const yearMatch = title.match(/\b(20\d{2})\b/);
    return yearMatch ? parseInt(yearMatch[1]) : 2023;
  }

  extractYearFromDate(dateStr) {
    if (!dateStr) return null;
    // Expect formats like "2014 Aug 18" or "2021 Mar 4"; fallback: first 4-digit year
    const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }

  extractTagsFromTitle(title) {
    const tags = [];
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('microgravity') || titleLower.includes('spaceflight')) {
      tags.push('Microgravity');
    }
    if (titleLower.includes('bone') || titleLower.includes('skeletal')) {
      tags.push('Bone Loss');
    }
    if (titleLower.includes('plant') || titleLower.includes('arabidopsis')) {
      tags.push('Plant Growth');
    }
    if (titleLower.includes('cardiac') || titleLower.includes('heart')) {
      tags.push('Cardiovascular');
    }
    if (titleLower.includes('radiation')) {
      tags.push('Radiation');
    }
    if (titleLower.includes('muscle') || titleLower.includes('atrophy')) {
      tags.push('Exercise');
    }
    if (titleLower.includes('sleep') || titleLower.includes('circadian')) {
      tags.push('Sleep');
    }
    if (titleLower.includes('protein') || titleLower.includes('crystal')) {
      tags.push('Crystallization');
    }
    
    return tags.length > 0 ? tags : ['Space Research'];
  }

  detectOrganism(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('mouse') || titleLower.includes('mice') || titleLower.includes('rodent')) {
      return 'Rodent';
    }
    if (titleLower.includes('arabidopsis') || titleLower.includes('plant')) {
      return 'Arabidopsis';
    }
    if (titleLower.includes('microbe') || titleLower.includes('bacteria') || titleLower.includes('fungi')) {
      return 'Microbes';
    }
    if (titleLower.includes('human') || titleLower.includes('astronaut')) {
      return 'Human';
    }
    if (titleLower.includes('protein')) {
      return 'Protein';
    }
    
    return 'Mixed';
  }

  detectPlatform(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('iss') || titleLower.includes('space station')) {
      return 'ISS';
    }
    if (titleLower.includes('ground') || titleLower.includes('simulation')) {
      return 'Ground Simulation';
    }
    if (titleLower.includes('parabolic')) {
      return 'Parabolic Flight';
    }
    if (titleLower.includes('sounding rocket')) {
      return 'Sounding Rocket';
    }
    
    return 'ISS';
  }

  generateSummary(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('microgravity') && titleLower.includes('bone')) {
      return 'Study examines bone density changes in microgravity conditions, revealing significant structural adaptations.';
    }
    if (titleLower.includes('plant') && titleLower.includes('space')) {
      return 'Research investigates plant growth patterns and gene expression under spaceflight conditions.';
    }
    if (titleLower.includes('radiation') && titleLower.includes('dna')) {
      return 'Analysis of radiation effects on cellular DNA repair mechanisms in space-relevant conditions.';
    }
    if (titleLower.includes('muscle') && titleLower.includes('atrophy')) {
      return 'Investigation of muscle mass changes and countermeasures during extended space missions.';
    }
    
    return `Research study investigating ${titleLower.split(' ').slice(0, 3).join(' ')} in space environment conditions.`;
  }

  generateExtendedSummary(title) {
    const summary = this.generateSummary(title);
    return `${summary} This comprehensive study provides valuable insights for understanding biological responses to space conditions and developing effective countermeasures for long-duration space missions. The research contributes to our knowledge of space biology and has implications for future human space exploration.`;
  }

  calculateConfidence(title) {
    // Simple confidence calculation based on title characteristics
    let confidence = 0.7; // Base confidence
    
    if (title.toLowerCase().includes('comprehensive') || title.toLowerCase().includes('systematic')) {
      confidence += 0.1;
    }
    if (title.toLowerCase().includes('longitudinal') || title.toLowerCase().includes('long-term')) {
      confidence += 0.1;
    }
    if (title.toLowerCase().includes('novel') || title.toLowerCase().includes('new')) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 0.95);
  }

  estimateCitations(title) {
    // Simple citation estimation based on title characteristics
    let citations = 15; // Base citations
    
    if (title.toLowerCase().includes('comprehensive') || title.toLowerCase().includes('systematic')) {
      citations += 10;
    }
    if (title.toLowerCase().includes('novel') || title.toLowerCase().includes('breakthrough')) {
      citations += 15;
    }
    if (title.toLowerCase().includes('longitudinal') || title.toLowerCase().includes('long-term')) {
      citations += 8;
    }
    
    return citations;
  }

  parseAuthorsString(authors) {
    if (!authors) return [];
    if (Array.isArray(authors)) return authors;
    return String(authors)
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);
  }

  extractJournal(title) {
    const journals = [
      'Space Medicine & Biology', 'Plant Space Biology', 'Aerospace Medicine',
      'Astrobiology Research', 'Radiation Biology', 'Space Exercise Science',
      'Sleep & Space Medicine', 'Crystal Growth & Design', 'Nature Microgravity',
      'Space Health Quarterly', 'Space Biology Research'
    ];
    
    return journals[Math.floor(Math.random() * journals.length)];
  }

  // Get KPI data based on loaded publications
  getKPIData() {
    const totalPublications = this.publications.length;
    // Sum real citations from API (fallback to 0 if missing/invalid)
    const citationIndex = this.publiclicationsSumCitations();

    return {
      totalPublications,
      activeExperiments: Math.floor(totalPublications * 0.21), // ~21% of publications
      researchAreas: 23,
      collaborations: Math.floor(totalPublications * 0.15), // ~15% of publications
      recentPublications: Math.floor(totalPublications * 0.07), // ~7% recent
      citationIndex
    };
  }

  // Helper: sum citations across publications
  publiclicationsSumCitations() {
    try {
      return this.publications.reduce((sum, p) => {
        const val = (typeof p.citations === 'number') ? p.citations : parseFloat(p.citations);
        return sum + (Number.isFinite(val) ? val : 0);
      }, 0);
    } catch {
      return 0;
    }
  }

  // Get research areas data based on loaded publications
  getResearchAreas() {
    const areas = {};
    
    this.publications.forEach(pub => {
      const tags = this.extractKeywordsAsTags(pub.keywords);
      tags.forEach(tag => {
        areas[tag] = (areas[tag] || 0) + 1;
      });
    });

    const total = Object.values(areas).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(areas)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100 * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7); // Top 7 areas
  }

  // Get unique keywords from API
  async getUniqueKeywords() {
    try {
      const keywords = await apiService.fetchKeywords();
      return keywords;
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
      // Fallback: extract from loaded publications
      if (this.publications && this.publications.length > 0) {
        const keywordsSet = new Set();
        this.publications.forEach(pub => {
          const tags = this.extractKeywordsAsTags(pub.keywords);
          tags.forEach(kw => keywordsSet.add(kw));
        });
        return Array.from(keywordsSet).sort();
      }
      return [];
    }
  }
  
  // Get all unique keywords from publications for filtering
  getAllKeywords() {
    const keywordSet = new Set();
    
    this.publications.forEach(pub => {
      const tags = this.extractKeywordsAsTags(pub.keywords);
      tags.forEach(tag => keywordSet.add(tag));
    });
    
    return Array.from(keywordSet).sort();
  }

  // Get publications by year data
  getPublicationsByYear() {
    const yearData = {};
    
    this.publications.forEach(pub => {
      const year = this.extractYearFromDate(pub.date) || this.extractYearFromTitle(pub.title);
      yearData[year] = (yearData[year] || 0) + 1;
    });

    return Object.entries(yearData)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }
}

export default new DataService();
