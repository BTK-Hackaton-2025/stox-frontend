import React, { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Target, 
  DollarSign, 
  Tag, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  BarChart3,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { aiService, type SEOAnalysisRequest, type SEOAnalysisResponse } from '@/services/ai';
import { useToast } from '@/hooks/use-toast';

interface SEOAnalyzerProps {
  initialImages?: File[] | string[];
  productInfo?: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    tags?: string[];
  };
  className?: string;
  onAnalysisComplete?: (analysis: SEOAnalysisResponse) => void;
}

const marketplaces = [
  { id: 'trendyol', name: 'Trendyol', logo: '🛒' },
  { id: 'hepsiburada', name: 'Hepsiburada', logo: '🟠' },
  { id: 'amazon', name: 'Amazon', logo: '📦' },
  { id: 'n11', name: 'N11', logo: '🟡' },
  { id: 'gittigidiyor', name: 'GittiGidiyor', logo: '🟣' },
  { id: 'sahibinden', name: 'Sahibinden', logo: '🔵' }
];

const categories = [
  'Elektronik', 'Giyim & Aksesuar', 'Ev & Yaşam', 'Spor & Outdoor',
  'Kitap & Müzik', 'Otomotiv', 'Anne & Bebek', 'Kozmetik & Kişisel Bakım',
  'Süpermarket', 'Pet Shop', 'Oyuncak', 'Bahçe & Yapı Market'
];

export default function SEOAnalyzer({
  initialImages = [],
  productInfo,
  className,
  onAnalysisComplete
}: SEOAnalyzerProps) {
  const [images, setImages] = useState<File[]>(
    initialImages.filter(img => img instanceof File) as File[]
  );
  const [formData, setFormData] = useState({
    title: productInfo?.title || '',
    description: productInfo?.description || '',
    category: productInfo?.category || '',
    price: productInfo?.price?.toString() || '',
    tags: productInfo?.tags?.join(', ') || ''
  });
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>(['trendyol']);
  const [analysisType, setAnalysisType] = useState<'basic' | 'detailed' | 'competitive'>('detailed');
  const [analysis, setAnalysis] = useState<SEOAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMarketplaceToggle = (marketplaceId: string) => {
    setSelectedMarketplaces(prev => 
      prev.includes(marketplaceId)
        ? prev.filter(id => id !== marketplaceId)
        : [...prev, marketplaceId]
    );
  };

  const runSEOAnalysis = async () => {
    if (images.length === 0) {
      toast({
        title: "Resim Gerekli",
        description: "SEO analizi için en az bir resim yüklemelisiniz.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const request: SEOAnalysisRequest = {
        images,
        productInfo: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: formData.price ? parseFloat(formData.price) : undefined,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined
        },
        targetMarketplaces: selectedMarketplaces,
        analysisType
      };

      const result = await aiService.analyzeSEO(request);
      setAnalysis(result);
      onAnalysisComplete?.(result);

      toast({
        title: "Analiz Tamamlandı",
        description: `SEO analizi ${result.processingTime.toFixed(2)} saniyede tamamlandı.`,
      });

    } catch (error) {
      console.error('SEO analysis failed:', error);
      toast({
        title: "Analiz Hatası",
        description: error instanceof Error ? error.message : 'SEO analizi sırasında bir hata oluştu',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Analiz Aracı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Ürün Resimleri</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="seo-images"
              />
              <label htmlFor="seo-images" className="cursor-pointer">
                <div className="space-y-2">
                  <Eye className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Analiz için resimlerinizi yükleyin
                  </p>
                </div>
              </label>
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ürün Başlığı</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ürün başlığınızı girin"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Fiyat (TL)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Etiketler</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="etiket1, etiket2, etiket3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Ürün Açıklaması</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ürün açıklamanızı girin..."
              rows={3}
            />
          </div>

          {/* Marketplace Selection */}
          <div className="space-y-3">
            <Label>Hedef Marketplaces</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {marketplaces.map(marketplace => (
                <div key={marketplace.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={marketplace.id}
                    checked={selectedMarketplaces.includes(marketplace.id)}
                    onCheckedChange={() => handleMarketplaceToggle(marketplace.id)}
                  />
                  <label htmlFor={marketplace.id} className="text-sm font-medium cursor-pointer">
                    {marketplace.logo} {marketplace.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Type */}
          <div className="space-y-3">
            <Label>Analiz Türü</Label>
            <div className="flex gap-2">
              <Button
                variant={analysisType === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('basic')}
              >
                Temel
              </Button>
              <Button
                variant={analysisType === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('detailed')}
              >
                Detaylı
              </Button>
              <Button
                variant={analysisType === 'competitive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('competitive')}
              >
                Rekabet Analizi
              </Button>
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={runSEOAnalysis}
            disabled={isAnalyzing || images.length === 0}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analiz Ediliyor...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                SEO Analizi Başlat
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analiz Sonuçları
              </div>
              <Badge variant="outline">
                Genel Skor: {analysis.analysis.overallScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="images">Resim Analizi</TabsTrigger>
                <TabsTrigger value="seo">SEO Önerileri</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Genel Skor</p>
                          <p className={cn("text-2xl font-bold", getScoreColor(analysis.analysis.overallScore))}>
                            {analysis.analysis.overallScore}
                          </p>
                        </div>
                        {getScoreIcon(analysis.analysis.overallScore)}
                      </div>
                      <Progress value={analysis.analysis.overallScore} className="mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Resim Kalitesi</p>
                          <p className={cn("text-2xl font-bold", getScoreColor(
                            analysis.analysis.imageAnalysis.reduce((acc, img) => acc + img.scores.quality, 0) / analysis.analysis.imageAnalysis.length
                          ))}>
                            {Math.round(analysis.analysis.imageAnalysis.reduce((acc, img) => acc + img.scores.quality, 0) / analysis.analysis.imageAnalysis.length)}
                          </p>
                        </div>
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">SEO Uyumluluğu</p>
                          <p className={cn("text-2xl font-bold", getScoreColor(
                            analysis.analysis.imageAnalysis.reduce((acc, img) => acc + img.scores.seoFriendliness, 0) / analysis.analysis.imageAnalysis.length
                          ))}>
                            {Math.round(analysis.analysis.imageAnalysis.reduce((acc, img) => acc + img.scores.seoFriendliness, 0) / analysis.analysis.imageAnalysis.length)}
                          </p>
                        </div>
                        <Search className="w-4 h-4 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pazarlanabilirlik</p>
                          <p className={cn("text-2xl font-bold", getScoreColor(
                            analysis.analysis.imageAnalysis.reduce((acc, img) => acc + img.scores.marketability, 0) / analysis.analysis.imageAnalysis.length
                          ))}>
                            {Math.round(analysis.analysis.imageAnalysis.reduce((acc, img) => acc + img.scores.marketability, 0) / analysis.analysis.imageAnalysis.length)}
                          </p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                {analysis.analysis.imageAnalysis.map((imageAnalysis, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Resim {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Kalite</p>
                          <p className={cn("text-xl font-bold", getScoreColor(imageAnalysis.scores.quality))}>
                            {imageAnalysis.scores.quality}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Kompozisyon</p>
                          <p className={cn("text-xl font-bold", getScoreColor(imageAnalysis.scores.composition))}>
                            {imageAnalysis.scores.composition}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pazarlanabilirlik</p>
                          <p className={cn("text-xl font-bold", getScoreColor(imageAnalysis.scores.marketability))}>
                            {imageAnalysis.scores.marketability}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">SEO</p>
                          <p className={cn("text-xl font-bold", getScoreColor(imageAnalysis.scores.seoFriendliness))}>
                            {imageAnalysis.scores.seoFriendliness}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Tespit Edilen Objeler</h4>
                        <div className="flex flex-wrap gap-1">
                          {imageAnalysis.detectedObjects.map((object, i) => (
                            <Badge key={i} variant="secondary">{object}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Önerilen Etiketler</h4>
                        <div className="flex flex-wrap gap-1">
                          {imageAnalysis.suggestedTags.map((tag, i) => (
                            <Badge key={i} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">İyileştirme Önerileri</h4>
                        <ul className="space-y-1">
                          {imageAnalysis.improvements.map((improvement, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Başlık Önerileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.analysis.seoRecommendations.titleSuggestions.map((title, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{title}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Anahtar Kelime Önerileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.analysis.seoRecommendations.keywordRecommendations.map((keyword, i) => (
                          <Badge key={i} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Fiyat Önerileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">Önerilen Fiyat Aralığı:</span>
                        <span className="text-lg font-bold text-green-600">
                          ₺{analysis.analysis.seoRecommendations.pricingInsights.suggestedPriceRange.min} - 
                          ₺{analysis.analysis.seoRecommendations.pricingInsights.suggestedPriceRange.max}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Market Konumlandırma:</h4>
                        <p className="text-sm text-muted-foreground">
                          {analysis.analysis.seoRecommendations.pricingInsights.marketPositioning}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="marketplace" className="space-y-4">
                {analysis.analysis.marketplaceOptimization.map((marketplace, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{marketplace.marketplace}</span>
                        <Badge variant={marketplace.optimizationScore >= 80 ? 'default' : marketplace.optimizationScore >= 60 ? 'secondary' : 'destructive'}>
                          {marketplace.optimizationScore}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={marketplace.optimizationScore} />
                      
                      <div>
                        <h4 className="font-medium mb-2">Özel Öneriler:</h4>
                        <ul className="space-y-1">
                          {marketplace.specificRecommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {marketplace.requiredChanges.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Gerekli Değişiklikler:</h4>
                          <ul className="space-y-1">
                            {marketplace.requiredChanges.map((change, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
