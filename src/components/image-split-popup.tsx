import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { type ImageUploadResponse } from '@/services/image';

interface ImageSplitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageUploadResponse[];
  title?: string;
}

export default function ImageSplitPopup({ 
  isOpen, 
  onClose, 
  images, 
  title = "Image Enhancement Results" 
}: ImageSplitPopupProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Update currentImageIndex when images prop changes to prevent out-of-bounds index
  useEffect(() => {
    setCurrentImageIndex(prevIndex => {
      if (images.length === 0) {
        return 0;
      }
      return Math.min(prevIndex, images.length - 1);
    });
  }, [images]);

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-hidden"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle className="text-xl font-semibold">
              {title}
            </DialogTitle>
            {hasMultipleImages && (
              <p className="text-sm text-muted-foreground mt-1">
                Image {currentImageIndex + 1} of {images.length}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* Split View Container */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4 h-[60vh]">
            {/* Original Image */}
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  Original
                </Badge>
              </div>
              <img
                src={currentImage.cloudFrontUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Enhanced Image */}
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <div className="absolute top-3 right-3 z-10">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✨ Enhanced
                </Badge>
              </div>
              {currentImage.enhancedUrl ? (
                <img
                  src={currentImage.enhancedUrl}
                  alt="Enhanced"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium">No Enhancement Available</p>
                    <p className="text-sm">This image wasn't enhanced</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          {hasMultipleImages && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentImageIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentImageIndex === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Image Info */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">
              {currentImage.originalImage.fileName}
            </p>
            <p>
              Original: {Math.round(currentImage.originalImage.size / 1024)}KB
              {currentImage.enhancedImage && (
                <> • Enhanced: {Math.round(currentImage.enhancedImage.size / 1024)}KB</>
              )}
            </p>
          </div>

          {/* Image Counter for Multiple Images */}
          {hasMultipleImages && (
            <div className="flex items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex 
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* OK Button */}
          <Button onClick={onClose} className="min-w-20">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
