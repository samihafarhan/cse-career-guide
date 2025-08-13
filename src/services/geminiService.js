import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(message, chatHistory = []) {
    try {
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1024,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Provide more specific error messages
      if (error.status === 503) {
        throw new Error('AI service is temporarily overloaded. Please try again in a few moments.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      } else if (error.status === 401) {
        throw new Error('API key is invalid or expired.');
      } else {
        throw new Error('AI service is currently unavailable. Please try again later.');
      }
    }
  }

  async streamResponse(message, chatHistory = [], onChunk) {
    try {
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1024,
        },
      });

      const result = await chat.sendMessageStream(message);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText && onChunk) {
          onChunk(chunkText);
        }
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      throw error;
    }
  }
}

export default new GeminiService();
