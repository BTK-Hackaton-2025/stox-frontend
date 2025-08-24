import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type ImageUploadResponse } from '@/services/image';

interface SimpleImageDisplayProps {
  uploadResponse: ImageUploadResponse;
  fileName: string;
  isSelected?: boolean;
  onClick?: () => void;
  selectedVersion?: 'original' | 'enhanced';
  onVersionSelect?: (version: 'original' | 'enhanced') => void;
  className?: string;
}

export default function SimpleImageDisplay({ 
  uploadResponse, 
  fileName, 
  isSelected = false,
  onClick,
  selectedVersion = 'enhanced',
  onVersionSelect,
  className 
}: SimpleImageDisplayProps) {
  const hasEnhanced = !!uploadResponse.enhancedUrl;

  const handleVersionClick = (version: 'original' | 'enhanced', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card onClick
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-primary ring-offset-2 shadow-lg' 
          : 'hover:ring-1 hover:ring-primary/50'
      } ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Split View Container */}
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-3">
          <div className="flex h-full">
            {/* Original Side */}
            <div 
              className={`flex-1 relative cursor-pointer transition-all duration-200 ${
                selectedVersion === 'original' 
                  ? 'ring-2 ring-blue-500 ring-inset' 
                  : 'hover:ring-1 hover:ring-blue-300 hover:ring-inset'
              }`}
              onClick={(e) => handleVersionClick('original', e)}
            >
              <img
                src={uploadResponse.cloudFrontUrl}
                alt={`${fileName} - Original`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs transition-colors ${
                    selectedVersion === 'original'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-white/90 text-gray-800'
                  }`}
                >
                  Original
                </Badge>
              </div>
              {selectedVersion === 'original' && (
                <div className="absolute top-1 right-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-white/50"></div>

            {/* Enhanced Side */}
            <div 
              className={`flex-1 relative cursor-pointer transition-all duration-200 ${
                hasEnhanced
                  ? selectedVersion === 'enhanced' 
                    ? 'ring-2 ring-green-500 ring-inset' 
                    : 'hover:ring-1 hover:ring-green-300 hover:ring-inset'
                  : 'cursor-not-allowed'
              }`}
              onClick={(e) => hasEnhanced && handleVersionClick('enhanced', e)}
            >
              {hasEnhanced ? (
                <>
                  <img
                    src={uploadResponse.enhancedUrl}
                    alt={`${fileName} - Enhanced`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs transition-colors ${
                        selectedVersion === 'enhanced'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      ✨ Enhanced
                    </Badge>
                  </div>
                  {selectedVersion === 'enhanced' && (
                    <div className="absolute top-1 left-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                  <div className="text-center">
                    <p className="text-xs">No Enhancement</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Info */}
        <div className="space-y-1">
          <p className="text-sm font-medium truncate" title={fileName}>
            {fileName}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Selected: <span className={`font-medium ${selectedVersion === 'original' ? 'text-blue-600' : 'text-green-600'}`}>
                {selectedVersion === 'original' ? 'Original' : 'Enhanced'}
              </span>
            </span>
            <span>{Math.round(uploadResponse.originalImage.size / 1024)}KB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
