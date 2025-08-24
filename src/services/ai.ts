// AI Service Functions - Chat & SEO Analysis

import { apiClient } from '@/lib/api';

// Chat Types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  suggestions?: string[];
  metadata?: {
    conversationId?: string;
    messageType?: 'text' | 'analysis' | 'suggestion';
    category?: 'market' | 'product' | 'general' | 'seo';
  };
}

export interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  category: 'market' | 'product' | 'general' | 'seo';
  messages: ChatMessage[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
  context?: {
    userId?: string;
    sessionId?: string;
    previousMessages?: ChatMessage[];
    userProfile?: unknown;
  };
}

export interface ChatMessageResponse {
  success: boolean;
  response: string;
  conversationId?: string;
  messageId?: string;
  timestamp?: string;
}

// SEO Analysis Types
export interface SEOAnalysisRequest {
  images: (File | string)[]; // File objects or image URLs
  productInfo?: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    tags?: string[];
  };
  targetMarketplaces?: string[];
  analysisType?: 'basic' | 'detailed' | 'competitive';
}

export interface SEOAnalysisResponse {
  success: boolean;
  message: string;
  analysis: {
    overallScore: number;
    imageAnalysis: {
      imageId: string;
      imageUrl?: string;
      scores: {
        quality: number;
        composition: number;
        marketability: number;
        seoFriendliness: number;
      };
      detectedObjects: string[];
      suggestedTags: string[];
      improvements: string[];
      colorAnalysis: {
        dominantColors: string[];
        colorHarmony: number;
        brandCompatibility: number;
      };
    }[];
    seoRecommendations: {
      titleSuggestions: string[];
      descriptionSuggestions: string[];
      keywordRecommendations: string[];
      categoryOptimization: string[];
      pricingInsights: {
        suggestedPriceRange: { min: number; max: number };
        competitiveAnalysis: string[];
        marketPositioning: string;
      };
    };
    marketplaceOptimization: {
      marketplace: string;
      optimizationScore: number;
      specificRecommendations: string[];
      requiredChanges: string[];
    }[];
    competitiveAnalysis?: {
      similarProducts: {
        title: string;
        price: number;
        marketplace: string;
        performanceScore: number;
      }[];
      marketGap: string[];
      opportunities: string[];
    };
  };
  processingTime: number;
  analysisId: string;
}

class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Send message to LangChain Agent for chat
   */
  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    try {
      const response = await apiClient.post<ChatMessageResponse>('/chat/message', {
        message: request.message,
        conversationId: request.conversationId,
        context: request.context
      });
      
      return response;
    } catch (error: unknown) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Send multiple messages in a conversation context
   */
  async sendConversationMessages(
    messages: ChatMessage[],
    conversationId?: string
  ): Promise<ChatMessageResponse> {
    try {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error('Last message must be from user');
      }

      const response = await this.sendMessage({
        message: lastMessage.content,
        conversationId,
        context: {
          previousMessages: messages.slice(0, -1) // All messages except the last one
        }
      });

      return response;
    } catch (error: unknown) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Perform SEO analysis on images and product information
   */
  async analyzeSEO(request: SEOAnalysisRequest): Promise<SEOAnalysisResponse> {
    try {
      const formData = new FormData();
      
      // Add images to form data
      if (request.images.length > 0) {
        request.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`images`, image);
          } else {
            // If it's a URL string, add it as imageUrls
            formData.append(`imageUrls[${index}]`, image);
          }
        });
      }

      // Add product information
      if (request.productInfo) {
        formData.append('productInfo', JSON.stringify(request.productInfo));
      }

      // Add target marketplaces
      if (request.targetMarketplaces) {
        formData.append('targetMarketplaces', JSON.stringify(request.targetMarketplaces));
      }

      // Add analysis type
      formData.append('analysisType', request.analysisType || 'basic');

      const response = await apiClient.postMultipart<SEOAnalysisResponse>(
        '/chat/seo',
        formData
      );
      
      return response;
    } catch (error: unknown) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Quick SEO analysis for single image
   */
  async quickImageSEO(image: File | string): Promise<Partial<SEOAnalysisResponse>> {
    try {
      const response = await this.analyzeSEO({
        images: [image],
        analysisType: 'basic'
      });

      return response;
    } catch (error: unknown) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Get AI suggestions for product optimization
   */
  async getProductOptimizationSuggestions(productData: {
    title: string;
    description?: string;
    category?: string;
    images?: string[];
    currentPerformance?: {
      views: number;
      clicks: number;
      sales: number;
    };
  }): Promise<ChatMessageResponse> {
    try {
      const optimizationPrompt = `
Ürün optimizasyonu için analiz yapın:

Ürün Bilgileri:
- Başlık: ${productData.title}
- Açıklama: ${productData.description || 'Belirtilmemiş'}
- Kategori: ${productData.category || 'Belirtilmemiş'}
- Resim sayısı: ${productData.images?.length || 0}

${productData.currentPerformance ? `
Mevcut Performans:
- Görüntülenme: ${productData.currentPerformance.views}
- Tıklama: ${productData.currentPerformance.clicks}
- Satış: ${productData.currentPerformance.sales}
` : ''}

Lütfen şunlar için öneriler verin:
1. Başlık optimizasyonu
2. Açıklama iyileştirmesi
3. Anahtar kelime önerileri
4. Fiyat stratejisi
5. Resim optimizasyonu
6. Marketplace-specific öneriler
      `;

      const response = await this.sendMessage({
        message: optimizationPrompt
      });

      return response;
    } catch (error: unknown) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Get market analysis and trends
   */
  async getMarketAnalysis(query: {
    category?: string;
    keywords?: string[];
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
    region?: string;
  }): Promise<ChatMessageResponse> {
    try {
      const analysisPrompt = `
Market analizi yapın:

${query.category ? `Kategori: ${query.category}` : ''}
${query.keywords ? `Anahtar kelimeler: ${query.keywords.join(', ')}` : ''}
${query.timeframe ? `Zaman aralığı: ${query.timeframe}` : ''}
${query.region ? `Bölge: ${query.region}` : ''}

Lütfen şunları analiz edin:
1. Güncel market trendleri
2. Fiyat analizi
3. Rekabet durumu
4. Büyüme fırsatları
5. Risk faktörleri
6. Önerilen stratejiler
      `;

      const response = await this.sendMessage({
        message: analysisPrompt
      });

      return response;
    } catch (error: unknown) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Generate product descriptions using AI
   */
  async generateProductDescription(productInfo: {
    title: string;
    category: string;
    features?: string[];
    targetAudience?: string;
    tone?: 'professional' | 'casual' | 'luxury' | 'technical';
    length?: 'short' | 'medium' | 'long';
  }): Promise<ChatMessageResponse> {
    try {
      const descriptionPrompt = `
Ürün açıklaması oluşturun:

Ürün: ${productInfo.title}
Kategori: ${productInfo.category}
${productInfo.features ? `Özellikler: ${productInfo.features.join(', ')}` : ''}
${productInfo.targetAudience ? `Hedef kitle: ${productInfo.targetAudience}` : ''}
Ton: ${productInfo.tone || 'professional'}
Uzunluk: ${productInfo.length || 'medium'}

SEO dostu, çekici ve satış odaklı bir ürün açıklaması yazın.
      `;

      const response = await this.sendMessage({
        message: descriptionPrompt
      });

      return response;
    } catch (error: unknown) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Handle AI-related errors consistently
   */
  private handleAIError(error: unknown): Error {
    // Handle network errors
    if (error && typeof error === 'object' && 'status' in error) {
      switch (error.status) {
        case 429:
          return new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.');
        case 503:
          return new Error('AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        case 413:
          return new Error('Gönderilen veri çok büyük. Lütfen daha küçük resimler veya kısa mesajlar kullanın.');
        case 400:
          return new Error('Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.');
        case 401:
          return new Error('Bu işlem için yetkiniz bulunmuyor. Lütfen giriş yapın.');
        case 500:
          return new Error('AI servisi bir hata ile karşılaştı. Lütfen daha sonra tekrar deneyin.');
        default:
          break;
      }
    }

    // Handle validation errors
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      const messages = error.errors.map((err: { message: string }) => err.message).join(', ');
      return new Error(messages);
    }

    return error instanceof Error ? error : new Error('AI servisi ile iletişim kurarken bir hata oluştu');
  }

  /**
   * Format chat message for display
   */
  formatChatMessage(response: ChatMessageResponse): ChatMessage {
    return {
      id: response.messageId || Date.now().toString(),
      content: response.response,
      role: 'assistant',
      timestamp: response.timestamp 
        ? new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [], // Extract suggestions from response text if needed
      metadata: {
        conversationId: response.conversationId,
        messageType: 'text',
        category: 'general'
      }
    };
  }

  /**
   * Create user message
   */
  createUserMessage(content: string): ChatMessage {
    return {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      metadata: {
        messageType: 'text'
      }
    };
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
