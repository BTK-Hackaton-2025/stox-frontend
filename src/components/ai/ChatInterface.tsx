import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  ImageIcon,
  Loader2,
  X
} from "lucide-react";
import { imageService } from "@/services/image";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  suggestions?: string[];
  imageUrl?: string;
  isImage?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, conversationId?: string) => void | Promise<void>;
  isLoading?: boolean;
  conversationTitle?: string;
}

const suggestionPrompts = [
  {
    icon: <TrendingUp className="w-4 h-4" />,
    title: "Market Analizi",
    prompt: "Elektronik piyasasının güncel trendlerini analiz edebilir misiniz?"
  },
  {
    icon: <Package className="w-4 h-4" />,
    title: "Ürün Optimizasyonu",
    prompt: "Ürün listelerimi daha iyi görünürlüğe sahip hale getirebilir misiniz?"
  },
  {
    icon: <DollarSign className="w-4 h-4" />,
    title: "Fiyat Önerisi",
    prompt: "Rekabet eden ürünler için en iyi fiyat stratejisi nedir?"
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    title: "Performans Raporu",
    prompt: "En iyi ürünlerim için bir performans raporu oluşturabilir misiniz?"
  }
];

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
  uploadResponse?: {
    cloudFrontUrl: string;
  };
  isUploading: boolean;
  error?: string;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  conversationTitle = "Yeni Konuşma"
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState(1);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (isLoading) return;

    // Check if we have images to upload first
    const imagesToUpload = selectedImages.filter(img => !img.uploadResponse && !img.isUploading);
    
    if (imagesToUpload.length > 0) {
      // Upload remaining images first
      await uploadPendingImages();
      return;
    }

    // Send message with uploaded image URLs
    const imageUrls = selectedImages
      .filter(img => img.uploadResponse?.cloudFrontUrl)
      .map(img => img.uploadResponse?.cloudFrontUrl);

    let messageContent = input.trim();
    
    // Add image URLs to message if any
    if (imageUrls.length > 0) {
      const imageText = imageUrls.map(url => `Resim analizi: ${url}`).join('\n');
      messageContent = messageContent ? `${messageContent}\n\n${imageText}` : imageText;
    }

    // Send message if we have content or images
    if (messageContent || imageUrls.length > 0) {
      onSendMessage(messageContent);
      setInput("");
      setRows(1);
      setSelectedImages([]); // Clear images after sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Auto-resize textarea
    const newRows = Math.min(Math.max(1, value.split('\n').length), 5);
    setRows(newRows);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Geçersiz Dosya",
          description: `${file.name} bir resim dosyası değil.`,
          variant: "destructive"
        });
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Dosya Çok Büyük",
          description: `${file.name} çok büyük. Maksimum 10MB.`,
          variant: "destructive"
        });
        continue;
      }

      // Add to selected images
      const imageId = Date.now().toString() + Math.random().toString(36);
      const preview = URL.createObjectURL(file);
      
      const newImage: SelectedImage = {
        id: imageId,
        file,
        preview,
        isUploading: false
      };

      setSelectedImages(prev => [...prev, newImage]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPendingImages = async () => {
    const imagesToUpload = selectedImages.filter(img => !img.uploadResponse && !img.isUploading);
    if (imagesToUpload.length === 0) return;

    // Mark images as uploading
    setSelectedImages(prev => prev.map(img => 
      imagesToUpload.some(uploadImg => uploadImg.id === img.id) 
        ? { ...img, isUploading: true, error: undefined }
        : img
    ));

    // Upload images
    for (const image of imagesToUpload) {
      try {
        const response = await imageService.uploadImage(image.file, ["chat", "ai-analysis"]);
        
        setSelectedImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, uploadResponse: response, isUploading: false }
            : img
        ));
      } catch (error) {
        console.error('Image upload failed:', error);
        setSelectedImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, isUploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
            : img
        ));
      }
    }
  };

  const removeImage = (imageId: string) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup object URLs when component unmounts or selectedImages change
  useEffect(() => {
    return () => {
      // Revoke all object URLs to prevent memory leaks
      selectedImages.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [selectedImages]);

  const MessageBubble = ({ message }: { message: Message }) => {
    // Check if message contains image URL
    const imageUrlMatch = message.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
    const hasImage = imageUrlMatch || message.imageUrl;
    const imageUrl = message.imageUrl || imageUrlMatch?.[0];
    
    return (
      <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.role === 'assistant' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
          <Card className={`${
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted/50'
          }`}>
            <CardContent className="p-3">
              {hasImage && imageUrl && (
                <div className="mb-3">
                  <img
                    src={imageUrl}
                    alt="Uploaded image"
                    className="max-w-full h-auto rounded-lg border max-h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="mb-0 whitespace-pre-wrap">
                  {hasImage && imageUrlMatch 
                    ? message.content.replace(imageUrlMatch[0], '').replace('Resim analizi: ', '').trim() || 'Resim analizi için yüklendi'
                    : message.content
                  }
                </p>
              </div>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span>{message.timestamp}</span>
          {message.role === 'assistant' && (
            <>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ThumbsDown className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <RotateCcw className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              {conversationTitle}
            </h3>
            <p className="text-sm text-muted-foreground">Kişisel Çoklu Market AI Aracı</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Stox Ai
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Stox AI'ye Hoş Geldiniz</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Kişisel Çoklu Market AI Aracı. Market trendleri, ürün optimizasyonu, fiyat stratejileri ve genel iş soruları hakkında herhangi bir şey sorabilirsiniz.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestionPrompts.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onSendMessage(suggestion.prompt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          {suggestion.icon}
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {suggestion.prompt}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse animation-delay-200" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse animation-delay-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Stox AI düşünüyor...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="p-4 pb-2 border-b border-border/20">
            <div className="flex gap-3 overflow-x-auto">
              {selectedImages.map((image) => (
                <div key={image.id} className="relative flex-shrink-0">
                  <div className={`w-20 h-20 rounded-lg border-2 border-dashed overflow-hidden relative ${
                    image.isUploading ? 'opacity-50 border-blue-300' : 
                    image.error ? 'border-red-300' : 
                    image.uploadResponse ? 'border-green-300' : 'border-gray-300'
                  }`}>
                    <img
                      src={image.preview}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Loading Overlay */}
                    {image.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                    
                    {/* Success Indicator */}
                    {image.uploadResponse && (
                      <div className="absolute top-1 right-1">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Error Indicator */}
                    {image.error && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">!</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  
                  {/* Status Text */}
                  <div className="mt-1 text-center">
                    <span className={`text-xs ${
                      image.isUploading ? 'text-blue-600' : 
                      image.error ? 'text-red-600' : 
                      image.uploadResponse ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {image.isUploading ? 'Yükleniyor...' : 
                       image.error ? 'Hata' : 
                       image.uploadResponse ? 'Hazır' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-end gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={selectedImages.length > 0 ? "Resimler hakkında bir mesaj yazın (isteğe bağlı)..." : "Stox AI'ye herhangi bir şey sorabilirsiniz..."}
                className="resize-none pr-12 min-h-[44px]"
                rows={rows}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || (selectedImages.length === 0 && !input.trim())}
                className="absolute right-2 bottom-2 h-8 w-8 p-0"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            title="Resim yükleme"
            placeholder="Resim yükleme"
          />
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Stox AI hatalar yapabilir. Lütfen önemli bilgileri doğrulayın.
          </p>
        </div>
      </div>
    </div>
  );
}