import React, { useCallback, useState } from "react";
import { Upload, Image, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { imageService, type ImageUploadResponse } from "@/services/image";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onFileSelect?: (files: File[]) => void;
  onUploadComplete?: (uploadedImages: ImageUploadResponse[]) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
  autoUpload?: boolean;
  tags?: string[];
}

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress?: number;
  uploadResponse?: ImageUploadResponse;
  error?: string;
}

export default function UploadZone({
  onFileSelect,
  onUploadComplete,
  onUploadStart,
  onUploadEnd,
  maxFiles = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className,
  autoUpload = false,
  tags = []
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [filesWithStatus, setFilesWithStatus] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateAndAddFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = imageService.validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Dosya Doğrulama Hatası",
        description: errors.join('\n'),
        variant: "destructive"
      });
    }

    if (validFiles.length > 0) {
      const currentCount = filesWithStatus.length;
      const availableSlots = maxFiles - currentCount;
      const filesToAdd = validFiles.slice(0, availableSlots);

      const newFilesWithStatus: FileWithStatus[] = filesToAdd.map(file => ({
        file,
        status: 'pending'
      }));

      const updatedFiles = [...filesWithStatus, ...newFilesWithStatus];
      setFilesWithStatus(updatedFiles);

      // Call onFileSelect with just the File objects
      const allFiles = updatedFiles.map(f => f.file);
      onFileSelect?.(allFiles);

      // Auto-upload if enabled
      if (autoUpload) {
        uploadFiles(newFilesWithStatus);
      }

      if (filesToAdd.length < validFiles.length) {
        toast({
          title: "Dosya Limiti",
          description: `Maksimum ${maxFiles} dosya yükleyebilirsiniz. ${validFiles.length - filesToAdd.length} dosya eklenmedi.`,
          variant: "destructive"
        });
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      acceptedTypes.includes(file.type)
    );

    if (files.length > 0) {
      validateAndAddFiles(files);
    }
  }, [acceptedTypes, maxFiles, filesWithStatus, autoUpload, tags]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndAddFiles(files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = filesWithStatus.filter((_, i) => i !== index);
    setFilesWithStatus(updatedFiles);
    
    const allFiles = updatedFiles.map(f => f.file);
    onFileSelect?.(allFiles);
  };

  const uploadFiles = async (filesToUpload: FileWithStatus[] = filesWithStatus) => {
    if (isUploading) return;

    setIsUploading(true);
    onUploadStart?.(); // Notify parent that upload started
    const pendingFiles = filesToUpload.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      setIsUploading(false);
      onUploadEnd?.(); // Notify parent that upload ended
      return;
    }

    try {
      // Update status to uploading
      setFilesWithStatus(prev => 
        prev.map(f => 
          pendingFiles.includes(f) ? { ...f, status: 'uploading' as const, progress: 0 } : f
        )
      );

      const uploadPromises = pendingFiles.map(async (fileWithStatus, index) => {
        try {
          const response = await imageService.uploadImage(fileWithStatus.file, tags);
          
          // Update status to completed
          setFilesWithStatus(prev => 
            prev.map(f => 
              f.file === fileWithStatus.file 
                ? { ...f, status: 'completed' as const, progress: 100, uploadResponse: response }
                : f
            )
          );
          
          return response;
        } catch (error) {
          // Update status to error
          setFilesWithStatus(prev => 
            prev.map(f => 
              f.file === fileWithStatus.file 
                ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
                : f
            )
          );
          
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter((result): result is PromiseFulfilledResult<ImageUploadResponse> => result.status === 'fulfilled')
        .map(result => result.value);

      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful.length > 0) {
        toast({
          title: "Yükleme Tamamlandı",
          description: `${successful.length} resim başarıyla yüklendi.`,
        });
        
        onUploadComplete?.(successful);
      }

      if (failed > 0) {
        toast({
          title: "Yükleme Hatası",
          description: `${failed} resim yüklenemedi.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Yükleme Hatası",
        description: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      onUploadEnd?.(); // Notify parent that upload ended
    }
  };

  const retryUpload = (index: number) => {
    const fileToRetry = filesWithStatus[index];
    if (fileToRetry && fileToRetry.status === 'error') {
      const updatedFiles = [...filesWithStatus];
      updatedFiles[index] = { ...fileToRetry, status: 'pending', error: undefined };
      setFilesWithStatus(updatedFiles);
      uploadFiles([updatedFiles[index]]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          "upload-zone rounded-lg p-8 text-center cursor-pointer",
          isDragOver && "dragover"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Ürün Resimlerini Yükle</h3>
            <p className="text-muted-foreground">
              Resimleri sürükleyip bırakın veya tıklayarak seçin
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG, WebP (max {maxFiles} resim)
            </p>
          </div>
          
          <Button variant="outline" size="lg">
            <Upload className="w-4 h-4 mr-2" />
            Dosyaları Seç
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple
          className="hidden"
          onChange={handleFileSelect}
          title="Ürün Resimlerini Yükle"
          placeholder="Ürün Resimlerini Yükle"
        />
      </div>

      {/* Selected Files */}
      {filesWithStatus.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Seçilen Resimler ({filesWithStatus.length}/{maxFiles})
            </h4>
            {!autoUpload && filesWithStatus.some(f => f.status === 'pending') && (
              <Button
                onClick={() => uploadFiles()}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Tümünü Yükle
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filesWithStatus.map((fileWithStatus, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-background-muted rounded-lg overflow-hidden border relative">
                  <img
                    src={fileWithStatus.uploadResponse?.enhancedUrl || fileWithStatus.uploadResponse?.cloudFrontUrl || URL.createObjectURL(fileWithStatus.file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    id={`image-${index}`}
                  />
                  
                  {/* Enhancement Badge */}
                  {fileWithStatus.uploadResponse?.enhancedUrl && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                        ✨ Enhanced
                      </Badge>
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {fileWithStatus.status === 'pending' && (
                      <div className="text-white text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs">Bekliyor</span>
                      </div>
                    )}
                    {fileWithStatus.status === 'uploading' && (
                      <div className="text-white text-center">
                        <Loader2 className="w-6 h-6 mx-auto mb-1 animate-spin" />
                        <span className="text-xs">Yükleniyor...</span>
                        {fileWithStatus.progress !== undefined && (
                          <Progress value={fileWithStatus.progress} className="w-16 mt-1" />
                        )}
                      </div>
                    )}
                    {fileWithStatus.status === 'completed' && (
                      <div className="text-green-400 text-center">
                        <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs">Tamamlandı</span>
                      </div>
                    )}
                    {fileWithStatus.status === 'error' && (
                      <div className="text-red-400 text-center">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs">Hata</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-6 px-2 text-xs text-white hover:text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            retryUpload(index);
                          }}
                        >
                          Tekrar Dene
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-muted-foreground truncate">
                    {fileWithStatus.file.name}
                  </p>
                  {fileWithStatus.error && (
                    <p className="text-xs text-red-500 truncate">
                      {fileWithStatus.error}
                    </p>
                  )}
                  
                  {/* Image Comparison Buttons */}
                  {fileWithStatus.uploadResponse?.enhancedUrl && fileWithStatus.status === 'completed' && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const img = document.getElementById(`image-${index}`) as HTMLImageElement;
                          if (img && fileWithStatus.uploadResponse?.cloudFrontUrl) {
                            img.src = fileWithStatus.uploadResponse.cloudFrontUrl;
                          }
                        }}
                      >
                        Original
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const img = document.getElementById(`image-${index}`) as HTMLImageElement;
                          if (img && fileWithStatus.uploadResponse?.enhancedUrl) {
                            img.src = fileWithStatus.uploadResponse.enhancedUrl;
                          }
                        }}
                      >
                        Enhanced
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}