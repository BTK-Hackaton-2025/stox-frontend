// Image Management Service Functions

import { apiClient } from '@/lib/api';

export interface ImageData {
  key: string;
  url: string;
  userId: string;
  imageType: 'original' | 'enhanced';
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  etag: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  originalImage: ImageData;
  enhancedImage?: ImageData;
  cloudFrontUrl: string;
  enhancedUrl?: string;
}

export interface ImageListResponse {
  success: boolean;
  message: string;
  images: ImageMetadata[];
  totalCount: number;
}

export interface ImageMetadata {
  imageId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  cloudFrontUrl: string;
  uploadedAt: string;
  tags?: string[];
}

export interface ImageDeleteResponse {
  success: boolean;
  message: string;
  deletedImageId: string;
}

class ImageService {
  private static instance: ImageService;

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Upload image to S3 and get CloudFront URL
   */
  async uploadImage(file: File, tags?: string[]): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      if (tags && tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }

      const response = await apiClient.postMultipart<ImageUploadResponse>(
        '/images/upload', 
        formData
      );
      
      return response;
    } catch (error: unknown) {
      throw this.handleImageError(error);
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(files: File[], tags?: string[]): Promise<ImageUploadResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, tags));
      const results = await Promise.allSettled(uploadPromises);
      
      const successful: ImageUploadResponse[] = [];
      const failed: { file: File; error: Error }[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push({ file: files[index], error: result.reason });
        }
      });
      
      if (failed.length > 0) {
        console.warn('Some images failed to upload:', failed);
      }
      
      return successful;
    } catch (error: unknown) {
      throw this.handleImageError(error);
    }
  }

  /**
   * Get list of user's uploaded images
   */
  async listImages(page: number = 1, limit: number = 20): Promise<ImageListResponse> {
    try {
      const response = await apiClient.get<ImageListResponse>('/images/list', {
        page: page.toString(),
        limit: limit.toString()
      });
      
      return response;
    } catch (error: unknown) {
      throw this.handleImageError(error);
    }
  }

  /**
   * Delete a specific image
   */
  async deleteImage(imageId: string): Promise<ImageDeleteResponse> {
    try {
      const response = await apiClient.delete<ImageDeleteResponse>(`/images/delete/${imageId}`);
      
      return response;
    } catch (error: unknown) {
      throw this.handleImageError(error);
    }
  }

  /**
   * Delete multiple images
   */
  async deleteImages(imageIds: string[]): Promise<ImageDeleteResponse[]> {
    try {
      const deletePromises = imageIds.map(id => this.deleteImage(id));
      const results = await Promise.allSettled(deletePromises);
      
      const successful: ImageDeleteResponse[] = [];
      const failed: { imageId: string; error: Error }[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push({ imageId: imageIds[index], error: result.reason });
        }
      });
      
      if (failed.length > 0) {
        console.warn('Some images failed to delete:', failed);
      }
      
      return successful;
    } catch (error: unknown) {
      throw this.handleImageError(error);
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    imageUrl: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    // If it's a CloudFront URL, we can add transformation parameters
    if (imageUrl.includes('cloudfront.net')) {
      const url = new URL(imageUrl);
      
      if (options.width) url.searchParams.set('w', options.width.toString());
      if (options.height) url.searchParams.set('h', options.height.toString());
      if (options.quality) url.searchParams.set('q', options.quality.toString());
      if (options.format) url.searchParams.set('f', options.format);
      
      return url.toString();
    }
    
    return imageUrl;
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya WebP formatında bir resim yükleyin.'
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Dosya boyutu çok büyük. Maksimum 10MB boyutunda resim yükleyebilirsiniz.'
      };
    }
    
    return { valid: true };
  }

  /**
   * Handle image-related errors consistently
   */
  private handleImageError(error: unknown): Error {
    // Handle network errors
    if (error && typeof error === 'object' && 'status' in error) {
      switch (error.status) {
        case 413:
          return new Error('Dosya boyutu çok büyük. Lütfen daha küçük bir resim yükleyin.');
        case 415:
          return new Error('Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya WebP formatında bir resim yükleyin.');
        case 429:
          return new Error('Çok fazla yükleme isteği. Lütfen biraz bekleyip tekrar deneyin.');
        case 403:
          return new Error('Bu işlem için yetkiniz bulunmuyor.');
        case 404:
          return new Error('Resim bulunamadı.');
        default:
          break;
      }
    }
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      const messages = error.errors.map((err: { message: string }) => err.message).join(', ');
      return new Error(messages);
    }
    
    return error instanceof Error ? error : new Error('Resim işlemi sırasında bir hata oluştu');
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();
