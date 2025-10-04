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
}

export default new ApiService();
