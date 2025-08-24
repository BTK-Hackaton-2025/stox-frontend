import React, { useState, useEffect } from 'react';
import { Trash2, Download, Eye, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { imageService, type ImageMetadata } from '@/services/image';
import { useToast } from '@/hooks/use-toast';

interface ImageGalleryProps {
  className?: string;
  onImageSelect?: (image: ImageMetadata) => void;
  onImageDelete?: (imageId: string) => void;
  selectable?: boolean;
  selectedImages?: string[];
}

export default function ImageGallery({
  className,
  onImageSelect,
  onImageDelete,
  selectable = false,
  selectedImages = []
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await imageService.listImages();
      setImages(response.images);
    } catch (error) {
      toast({
        title: "Resimler Yüklenemedi",
        description: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      setDeletingId(imageId);
      await imageService.deleteImage(imageId);
      
      setImages(prev => prev.filter(img => img.imageId !== imageId));
      onImageDelete?.(imageId);
      
      toast({
        title: "Resim Silindi",
        description: "Resim başarıyla silindi.",
      });
    } catch (error) {
      toast({
        title: "Silme Hatası",
        description: error instanceof Error ? error.message : 'Resim silinemedi',
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleDownload = async (image: ImageMetadata) => {
    try {
      const response = await fetch(image.cloudFrontUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName || image.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "İndirme Hatası",
        description: "Resim indirilemedi",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Resimler yükleniyor...</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={cn("text-center p-8 text-muted-foreground", className)}>
        <div className="mb-4">
          <Eye className="w-12 h-12 mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-medium mb-2">Henüz resim yok</h3>
        <p>İlk resminizi yüklemek için yukarıdaki yükleme alanını kullanın.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Yüklenen Resimler ({images.length})</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadImages}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yenile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card
            key={image.imageId}
            className={cn(
              "group relative overflow-hidden transition-all hover:shadow-lg",
              selectable && selectedImages.includes(image.imageId) && "ring-2 ring-primary",
              selectable && "cursor-pointer"
            )}
            onClick={() => selectable && onImageSelect?.(image)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={imageService.getOptimizedImageUrl(image.cloudFrontUrl, {
                    width: 300,
                    height: 300,
                    quality: 80,
                    format: 'webp'
                  })}
                  alt={image.originalName}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(image.cloudFrontUrl, '_blank');
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:text-white hover:bg-white/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(image.imageId);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectable && selectedImages.includes(image.imageId) && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-primary">
                      ✓
                    </Badge>
                  </div>
                )}

                {/* Deleting overlay */}
                {deletingId === image.imageId && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                      <span className="text-sm">Siliniyor...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <p className="font-medium text-sm truncate" title={image.originalName}>
                  {image.originalName}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(image.fileSize)}</span>
                  <span>{formatDate(image.uploadedAt)}</span>
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{image.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resmi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu resmi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
