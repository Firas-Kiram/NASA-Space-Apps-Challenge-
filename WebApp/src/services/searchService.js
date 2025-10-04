// Search service for handling search suggestions and search logic
import dataService from './dataService';

class SearchService {
  constructor() {
    this.publications = [];
    this.isLoaded = false;
  }

  async loadPublications() {
    if (this.isLoaded) {
      return this.publications;
    }

    try {
      await dataService.loadPublications();
      this.publications = dataService.publications;
      this.isLoaded = true;
      return this.publications;
    } catch (error) {
      console.error('Failed to load publications for search:', error);
      return [];
    }
  }

  // Get search suggestions based on query
  getSearchSuggestions(query, maxSuggestions = 8) {
    if (!query || query.length < 2) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const suggestions = [];

    // Search only in publication titles
    this.publications.forEach((pub, index) => {
      const title = pub.title || '';
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes(queryLower)) {
        suggestions.push({
          id: `title-${index}`,
          type: 'publication',
          title: title,
          link: pub.link,
          matchType: 'title',
          relevance: this.calculateRelevance(queryLower, titleLower)
        });
      }
    });

    // Sort by relevance and return top suggestions
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxSuggestions);
  }

  // Extract common keywords from publication titles
  extractKeywords() {
    const keywords = new Set();
    
    this.publications.forEach(pub => {
      const title = pub.title || '';
      
      // Extract key terms
      const terms = title
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(term => term.length > 3)
        .filter(term => !this.isCommonWord(term));

      terms.forEach(term => {
        if (term.length > 3) {
          keywords.add(term);
        }
      });

      // Extract multi-word phrases
      const phrases = this.extractPhrases(title);
      phrases.forEach(phrase => {
        if (phrase.length > 5) {
          keywords.add(phrase);
        }
      });
    });

    return Array.from(keywords);
  }

  // Extract meaningful phrases from titles
  extractPhrases(title) {
    const phrases = [];
    const titleLower = title.toLowerCase();
    
    // Common space research phrases
    const commonPhrases = [
      'microgravity', 'spaceflight', 'international space station', 'iss',
      'bone loss', 'muscle atrophy', 'radiation effects', 'plant growth',
      'cardiovascular', 'immune system', 'gene expression', 'protein crystallization',
      'astronaut health', 'space medicine', 'astrobiology', 'gravitational biology',
      'metabolic changes', 'oxidative stress', 'dna damage', 'cell culture',
      'tissue engineering', 'regenerative medicine', 'stem cells', 'neural development'
    ];

    commonPhrases.forEach(phrase => {
      if (titleLower.includes(phrase)) {
        phrases.push(phrase);
      }
    });

    return phrases;
  }

  // Check if a word is too common to be useful
  isCommonWord(word) {
    const commonWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'under', 'over',
      'this', 'that', 'these', 'those', 'a', 'an', 'as', 'are', 'was',
      'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
      'study', 'studies', 'research', 'analysis', 'effects', 'changes',
      'response', 'adaptation', 'mechanism', 'function', 'structure'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }

  // Calculate relevance score for search suggestions
  calculateRelevance(query, text) {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    let score = 0;
    
    // Exact match gets highest score
    if (textLower === queryLower) {
      score += 100;
    }
    
    // Starts with query gets high score
    if (textLower.startsWith(queryLower)) {
      score += 50;
    }
    
    // Contains query gets medium score
    if (textLower.includes(queryLower)) {
      score += 25;
    }
    
    // Word boundary match gets bonus
    const words = textLower.split(/\s+/);
    words.forEach(word => {
      if (word.startsWith(queryLower)) {
        score += 15;
      }
      if (word.includes(queryLower)) {
        score += 10;
      }
    });
    
    // Shorter matches get slight bonus
    if (textLower.length < 100) {
      score += 5;
    }
    
    return score;
  }

  // Get search results based on query
  searchPublications(query, filters = {}) {
    if (!query || query.length < 2) {
      return this.publications;
    }

    const queryLower = query.toLowerCase();
    const results = [];

    this.publications.forEach((pub, index) => {
      const title = pub.title || '';
      const titleLower = title.toLowerCase();
      
      // Check if title matches query
      if (titleLower.includes(queryLower)) {
        results.push({
          ...pub,
          id: `pub-${index}`,
          relevance: this.calculateRelevance(queryLower, titleLower)
        });
      }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Get popular search terms
  getPopularSearchTerms(limit = 10) {
    const termCounts = {};
    
    this.publications.forEach(pub => {
      const title = pub.title || '';
      const terms = title
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(term => term.length > 3)
        .filter(term => !this.isCommonWord(term));

      terms.forEach(term => {
        termCounts[term] = (termCounts[term] || 0) + 1;
      });
    });

    return Object.entries(termCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([term, count]) => ({ term, count }));
  }
}

export default new SearchService();
