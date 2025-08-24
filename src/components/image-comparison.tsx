import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type ImageUploadResponse } from '@/services/image';

interface ImageComparisonProps {
  uploadResponse: ImageUploadResponse;
  fileName: string;
  className?: string;
}

export default function ImageComparison({ 
  uploadResponse, 
  fileName, 
  className 
}: ImageComparisonProps) {
  const [selectedView, setSelectedView] = useState<'original' | 'enhanced' | 'split'>('enhanced');
  
  if (!uploadResponse.enhancedUrl) {
    // If no enhanced version, show original only
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={uploadResponse.cloudFrontUrl}
              alt={fileName}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 truncate">{fileName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{fileName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              ✨ Enhanced Available
            </Badge>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Image Comparison - {fileName}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Original</h4>
                    <img
                      src={uploadResponse.cloudFrontUrl}
                      alt="Original"
                      className="w-full h-auto rounded-lg border"
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Size: {Math.round(uploadResponse.originalImage.size / 1024)}KB</p>
                      <p>Type: {uploadResponse.originalImage.contentType}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Enhanced</h4>
                    <img
                      src={uploadResponse.enhancedUrl}
                      alt="Enhanced"
                      className="w-full h-auto rounded-lg border"
                    />
                    {uploadResponse.enhancedImage && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Size: {Math.round(uploadResponse.enhancedImage.size / 1024)}KB</p>
                        <p>Type: {uploadResponse.enhancedImage.contentType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* View Toggle Buttons */}
        <div className="flex gap-1 mb-3">
          <Button
            variant={selectedView === 'original' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setSelectedView('original')}
          >
            Original
          </Button>
          <Button
            variant={selectedView === 'enhanced' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            onClick={() => setSelectedView('enhanced')}
          >
            Enhanced
          </Button>
          <Button
            variant={selectedView === 'split' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setSelectedView('split')}
          >
            Split View
          </Button>
        </div>

        {/* Image Display */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
          {selectedView === 'split' ? (
            <div className="flex h-full">
              <div className="flex-1 relative">
                <img
                  src={uploadResponse.cloudFrontUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">Original</Badge>
                </div>
              </div>
              <div className="flex-1 relative border-l">
                <img
                  src={uploadResponse.enhancedUrl}
                  alt="Enhanced"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Enhanced
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={selectedView === 'enhanced' ? uploadResponse.enhancedUrl : uploadResponse.cloudFrontUrl}
              alt={selectedView === 'enhanced' ? 'Enhanced' : 'Original'}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // Handle 'split' view as 'enhanced', guard against missing URL
              const url = selectedView === 'split' || selectedView === 'enhanced' 
                ? uploadResponse.enhancedUrl 
                : uploadResponse.cloudFrontUrl;
              
              if (!url) {
                console.warn('No URL available for the selected view');
                return;
              }
              
              // Open safely with reverse tabnabbing protection
              const newWindow = window.open(url, '_blank');
              if (newWindow) {
                newWindow.opener = null;
              }
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Full
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // Handle 'split' view as 'enhanced', guard against missing URL
              const url = selectedView === 'split' || selectedView === 'enhanced' 
                ? uploadResponse.enhancedUrl 
                : uploadResponse.cloudFrontUrl;
              
              if (!url) {
                console.warn('No URL available for download');
                return;
              }
              
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              link.click();
            }}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>

        {/* Enhancement Stats */}
        {uploadResponse.enhancedImage && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
            <h5 className="text-xs font-medium text-green-800 mb-1">Enhancement Details</h5>
            <div className="text-xs text-green-700 space-y-1">
              <div className="flex justify-between">
                <span>Size Change:</span>
                <span>
                  {uploadResponse.originalImage.size < uploadResponse.enhancedImage.size ? '+' : ''}
                  {Math.round(((uploadResponse.enhancedImage.size - uploadResponse.originalImage.size) / uploadResponse.originalImage.size) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span>{uploadResponse.originalImage.contentType} → {uploadResponse.enhancedImage.contentType}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
