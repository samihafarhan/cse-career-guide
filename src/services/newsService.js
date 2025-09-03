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

  // Get news sources - Updated with fallback approaches
  async getNewsSources() {
    try {
      // Try the original sources endpoint first
      let response = await fetch(
        `${this.baseURL}/news/sources?api_token=${this.apiToken}&locale=us`
      );
      
      // If sources endpoint doesn't work, try alternative approaches
      if (!response.ok) {
        console.warn('Sources endpoint failed, trying alternative approach...');
        
        // Try getting sources from recent tech/business articles
        response = await fetch(
          `${this.baseURL}/news/all?api_token=${this.apiToken}&categories=tech,business&limit=50&locale=us`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const articles = data.data || [];
        
        // Extract unique sources from articles
        const sourcesMap = new Map();
        
        articles.forEach(article => {
          if (article.source && article.source.trim()) {
            const sourceName = article.source.trim();
            if (!sourcesMap.has(sourceName)) {
              sourcesMap.set(sourceName, {
                name: sourceName,
                description: `News source providing ${article.category || 'tech/business'} coverage`,
                category: article.category || 'mixed',
                url: article.url ? new URL(article.url).origin : null,
                website: article.url ? new URL(article.url).origin : null
              });
            }
          }
        });
        
        return Array.from(sourcesMap.values()).slice(0, 20); // Return up to 20 sources
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      // If all else fails, return some default tech/business sources
      console.warn('All sources endpoints failed, returning default sources');
      return this.getDefaultSources();
    }
  }

  // Fallback method to provide default sources if API fails
  getDefaultSources() {
    return [
      {
        name: "TechCrunch",
        description: "Leading technology news and information website",
        category: "tech",
        url: "https://techcrunch.com",
        website: "https://techcrunch.com"
      },
      {
        name: "The Verge",
        description: "Technology, science, art, and culture news",
        category: "tech",
        url: "https://theverge.com",
        website: "https://theverge.com"
      },
      {
        name: "Ars Technica",
        description: "Technology news and information for IT professionals",
        category: "tech",
        url: "https://arstechnica.com",
        website: "https://arstechnica.com"
      },
      {
        name: "Wired",
        description: "Technology, culture, and politics news",
        category: "tech",
        url: "https://wired.com",
        website: "https://wired.com"
      },
      {
        name: "Forbes Technology",
        description: "Business and technology news from Forbes",
        category: "business",
        url: "https://forbes.com/technology",
        website: "https://forbes.com/technology"
      },
      {
        name: "Business Insider",
        description: "Business, finance, and technology news",
        category: "business",
        url: "https://businessinsider.com",
        website: "https://businessinsider.com"
      },
      {
        name: "Bloomberg Technology",
        description: "Technology business news and analysis",
        category: "business",
        url: "https://bloomberg.com/technology",
        website: "https://bloomberg.com/technology"
      },
      {
        name: "Reuters Technology",
        description: "Global technology news from Reuters",
        category: "tech",
        url: "https://reuters.com/technology",
        website: "https://reuters.com/technology"
      },
      {
        name: "Wall Street Journal Tech",
        description: "Technology coverage from WSJ",
        category: "business",
        url: "https://wsj.com/tech",
        website: "https://wsj.com/tech"
      },
      {
        name: "MIT Technology Review",
        description: "Technology insights and analysis",
        category: "tech",
        url: "https://technologyreview.com",
        website: "https://technologyreview.com"
      }
    ];
  }
}

export default new NewsService();