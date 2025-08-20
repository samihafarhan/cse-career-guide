// src/services/newsService.js
import { createApiErrorHandler } from '../utils/errorHandler'

const NEWS_API_BASE_URL = import.meta.env.VITE_NEWS_URL;
const API_TOKEN = import.meta.env.VITE_NEWS_API_KEY;

class NewsService {
  constructor() {
    this.baseURL = NEWS_API_BASE_URL;
    this.apiToken = API_TOKEN;
    this.handleError = createApiErrorHandler('NewsService');
  }

  // Get top headlines by category
  async getTopHeadlines(category = 'general', limit = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/news/top?api_token=${this.apiToken}&categories=${category}&limit=${limit}&locale=us`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.handleError(error, 'Failed to fetch top headlines');
    }
  }

  // Search news articles
  async searchNews(query, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/news/all?api_token=${this.apiToken}&search=${encodeURIComponent(query)}&limit=${limit}&locale=us`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.handleError(error, 'Failed to search news');
    }
  }

  // Get news by multiple categories
  async getNewsByCategories(categories = ['tech', 'business'], limit = 20) {
    try {
      const categoriesString = categories.join(',');
      const response = await fetch(
        `${this.baseURL}/news/all?api_token=${this.apiToken}&categories=${categoriesString}&limit=${limit}&locale=us`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.handleError(error, 'Failed to fetch categorized news');
    }
  }

  // Get news sources
  async getNewsSources() {
    try {
      const response = await fetch(
        `${this.baseURL}/news/sources?api_token=${this.apiToken}&locale=us`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.handleError(error, 'Failed to fetch news sources');
    }
  }
}

export default new NewsService();
