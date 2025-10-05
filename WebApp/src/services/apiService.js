// API service for fetching data from the backend
const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  async fetchPublications() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/publications`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching publications:', error);
      throw error;
    }
  }

  async fetchHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  }

  async fetchKeywords() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keywords`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching keywords:', error);
      throw error;
    }
  }

  async fetchPublicationsByYear() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/publications/by-year`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching publications by year:', error);
      throw error;
    }
  }

  async summarizePaper(title) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error summarizing paper:', error);
      throw error;
    }
  }

  // Knowledge Graph API methods
  async fetchKnowledgeGraphNodes(selectedPapers = null) {
    try {
      const url = selectedPapers && selectedPapers.length > 0 
        ? `${API_BASE_URL}/api/knowledge-graph/nodes?papers=${encodeURIComponent(selectedPapers.join(','))}`
        : `${API_BASE_URL}/api/knowledge-graph/nodes`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge graph nodes:', error);
      throw error;
    }
  }

  async fetchKnowledgeGraphEdges(selectedPapers = null) {
    try {
      const url = selectedPapers && selectedPapers.length > 0 
        ? `${API_BASE_URL}/api/knowledge-graph/edges?papers=${encodeURIComponent(selectedPapers.join(','))}`
        : `${API_BASE_URL}/api/knowledge-graph/edges`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge graph edges:', error);
      throw error;
    }
  }

  async fetchKnowledgeGraphStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge-graph/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge graph stats:', error);
      throw error;
    }
  }

  async fetchConcepts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/concepts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching concepts:', error);
      throw error;
    }
  }

  async fetchConceptsByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/concepts/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching concepts by category:', error);
      throw error;
    }
  }

  async fetchPapersForConcept(conceptId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/concepts/${encodeURIComponent(conceptId)}/papers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching papers for concept:', error);
      throw error;
    }
  }

  async fetchConceptsForPaper(paperTitle) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/papers/${encodeURIComponent(paperTitle)}/concepts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching concepts for paper:', error);
      throw error;
    }
  }

  // Paper selection API methods
  async fetchAllPapers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/papers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all papers:', error);
      throw error;
    }
  }

  async searchPapers(keyword) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/papers/search?q=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching papers:', error);
      throw error;
    }
  }

  async fetchRelatedPapers(selectedPapers) {
    try {
      const papersParam = selectedPapers.join(',');
      const response = await fetch(`${API_BASE_URL}/api/papers/related?papers=${encodeURIComponent(papersParam)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching related papers:', error);
      throw error;
    }
  }
}

export default new ApiService();
