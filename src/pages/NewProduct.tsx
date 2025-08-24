import React from "react";
import { Wand2, Save, Upload, Sparkles, Package, CheckCircle, ImageIcon, Store, Loader2, Search, BarChart3, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import UploadZone from "@/components/upload-zone";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

// TODO: Replace with API calls to fetch categories and marketplace data
const categories: string[] = [];
const marketplaces: { name: string; logo: string }[] = [];

import { ImageUploadResponse } from "@/services/image";
import { aiService, type SEOAnalysisResponse } from "@/services/ai";
import ImageSplitPopup from "@/components/image-split-popup";
import { useToast } from "@/hooks/use-toast";

export default function NewProduct() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = React.useState<ImageUploadResponse[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [seoAnalysis, setSeoAnalysis] = React.useState<SEOAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const { toast } = useToast();
  const [selectedMarketplaces, setSelectedMarketplaces] = React.useState<string[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [showUploadLoader, setShowUploadLoader] = React.useState(false);
  const [showEnhancementLoader, setShowEnhancementLoader] = React.useState(false);
  const [showSEOLoader, setShowSEOLoader] = React.useState(false);
  const [showImagePopup, setShowImagePopup] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [imageVersionSelections, setImageVersionSelections] = React.useState<Record<number, 'original' | 'enhanced'>>({});
  const [shouldShowPopupAfterLoad, setShouldShowPopupAfterLoad] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    price: "",
    category: "",
    keywords: "",
    tags: "",
    sku: "",
    inventory: "",
    weight: "",
    dimensions: ""
  });

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleUploadStart = () => {
    setShowUploadLoader(true);
  };

  const handleUploadEnd = () => {
    setShowUploadLoader(false);
  };

  const handleUploadComplete = (images: ImageUploadResponse[]) => {
    setUploadedImages(prev => [...prev, ...images]);
  };

  const handleLoaderComplete = (loaderType?: string) => {
    // Set flag to show popup after any loader completes
    setShouldShowPopupAfterLoad(true);
  };

  // Effect to show popup when we have images and a loader has completed
  React.useEffect(() => {
    if (shouldShowPopupAfterLoad && uploadedImages.length > 0) {
      setShowImagePopup(true);
      setShouldShowPopupAfterLoad(false); // Reset flag
    }
  }, [shouldShowPopupAfterLoad, uploadedImages.length]);

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleVersionSelect = (imageIndex: number, version: 'original' | 'enhanced') => {
    setImageVersionSelections(prev => ({
      ...prev,
      [imageIndex]: version
    }));
  };

  const getSelectedVersion = (imageIndex: number): 'original' | 'enhanced' => {
    return imageVersionSelections[imageIndex] || 'enhanced'; // Default to enhanced
  };

  const handleSEOAnalysis = (analysis: SEOAnalysisResponse) => {
    setSeoAnalysis(analysis);
    
    // Auto-populate form fields based on SEO recommendations
    if (analysis.analysis.seoRecommendations.titleSuggestions.length > 0 && !formData.title) {
      setFormData(prev => ({
        ...prev,
        title: analysis.analysis.seoRecommendations.titleSuggestions[0]
      }));
    }
    
    if (analysis.analysis.seoRecommendations.keywordRecommendations.length > 0) {
      const keywords = analysis.analysis.seoRecommendations.keywordRecommendations.slice(0, 5).join(', ');
      setFormData(prev => ({
        ...prev,
        tags: prev.tags ? `${prev.tags}, ${keywords}` : keywords
      }));
    }
    
    toast({
      title: "SEO Analizi Tamamlandı",
      description: `Genel skor: ${analysis.analysis.overallScore}/100. Form alanları otomatik dolduruldu.`,
    });
  };

  const runQuickSEOAnalysis = async () => {
    if (files.length === 0) {
      toast({
        title: "Resim Gerekli",
        description: "SEO analizi için en az bir resim yükleyin.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setShowSEOLoader(true);
    try {
      // Simulate realistic timing for SEO analysis steps
      await new Promise(resolve => setTimeout(resolve, 1000)); // Image processing
      
      const analysis = await aiService.analyzeSEO({
        images: files,
        productInfo: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: formData.price ? parseFloat(formData.price) : undefined,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined
        },
        targetMarketplaces: ['trendyol', 'hepsiburada'],
        analysisType: 'detailed'
      });
      
      handleSEOAnalysis(analysis);
    } catch (error) {
      toast({
        title: "SEO Analizi Hatası",
        description: error instanceof Error ? error.message : 'Analiz sırasında bir hata oluştu',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setShowSEOLoader(false);
    }
  };

  const generateAIContent = async () => {
    if (files.length === 0) {
      alert("Please upload at least one image first.");
      return;
    }
    
    setIsGenerating(true);
    // TODO: Replace with actual AI API call
    try {
      // API call to generate content from images
      // const response = await apiClient.post('/ai/generate-product', formData);
      // setFormData(response.data);
      alert("AI content generation will be implemented with real API endpoints.");
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFieldContent = async (fieldType: string) => {
    if (files.length === 0) {
      alert("Please upload at least one image first.");
      return;
    }
    
    // TODO: Replace with actual AI field generation API call
    try {
      // API call to generate specific field content
      // const response = await apiClient.post(`/ai/generate-field/${fieldType}`, { images: files });
      // setFormData({...formData, [fieldType]: response.data.content});
      alert(`AI ${fieldType} generation will be implemented with real API endpoints.`);
    } catch (error) {
      console.error(`AI ${fieldType} generation failed:`, error);
    }
  };

  const enhanceImages = async () => {
    if (files.length === 0) {
      toast({
        title: "Resim Gerekli",
        description: "Resim iyileştirmesi için en az bir resim yükleyin.",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    setShowEnhancementLoader(true);
    try {
      // Simulate realistic timing for image enhancement analysis steps
      await new Promise(resolve => setTimeout(resolve, 1500)); // Initial analysis
      
      // Use AI service to get image enhancement suggestions
      const response = await aiService.sendMessage({
        message: `Bu ürün resimlerini nasıl iyileştirebilirim? ${files.length} adet resim var. Ürün: ${formData.title || 'Belirtilmemiş'}, Kategori: ${formData.category || 'Belirtilmemiş'}. 

Lütfen şunlar için öneriler verin:
1. Resim kompozisyonu
2. Aydınlatma ve kalite
3. Arka plan önerileri
4. Ürün pozisyonlandırması
5. Marketplace standartlarına uygunluk
6. SEO dostu resim optimizasyonu`
      });

      // Show enhancement suggestions in a toast or modal
      toast({
        title: "Resim İyileştirme Önerileri",
        description: "AI önerileri alındı. Detaylar için chat panelini açın.",
      });
      
      // You could also open the AI panel here if needed
      console.log('Image enhancement suggestions:', response);
      
    } catch (error) {
      toast({
        title: "İyileştirme Hatası",
        description: error instanceof Error ? error.message : 'Resim iyileştirme önerileri alınamadı',
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
      setShowEnhancementLoader(false);
    }
  };

  const handleMarketplaceSelect = (marketplaceName: string) => {
    setSelectedMarketplaces(prev => 
      prev.includes(marketplaceName) 
        ? prev.filter(name => name !== marketplaceName)
        : [...prev, marketplaceName]
    );
  };

  const handlePublish = async () => {
    if (selectedMarketplaces.length === 0) {
      alert("Please select at least one marketplace to publish to.");
      return;
    }
    
    setIsPublishing(true);
    // TODO: Replace with actual product publishing API call
    try {
      // API call to publish product to selected marketplaces
      // const response = await apiClient.post('/products', {
      //   ...formData,
      //   images: files,
      //   marketplaces: selectedMarketplaces
      // });
      // alert("Product published successfully!");
      alert("Product publishing will be implemented with real API endpoints.");
    } catch (error) {
      console.error("Product publishing failed:", error);
      alert("Failed to publish product. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Loading states for different processes
  const uploadLoadingStates = [
    { text: "Resimler sunucuya yükleniyor..." },
    { text: "Dosya boyutları optimize ediliyor..." },
    { text: "AI ile resim kalitesi analiz ediliyor..." },
    { text: "Resim iyileştirme işlemi yapılıyor..." },
    { text: "CloudFront CDN'e aktarılıyor..." },
    { text: "Meta veriler kaydediliyor..." },
    { text: "Yükleme tamamlandı!" }
  ];

  const enhancementLoadingStates = [
    { text: "Resimler AI ile analiz ediliyor..." },
    { text: "Kompozisyon önerileri hazırlanıyor..." },
    { text: "Aydınlatma ve kalite değerlendiriliyor..." },
    { text: "Arka plan önerileri oluşturuluyor..." },
    { text: "Marketplace standartları kontrol ediliyor..." },
    { text: "SEO dostu optimizasyon önerileri hazırlanıyor..." },
    { text: "İyileştirme önerileri hazır!" }
  ];

  const seoLoadingStates = [
    { text: "Resimler SEO analizi için işleniyor..." },
    { text: "Anahtar kelimeler belirleniyor..." },
    { text: "Başlık önerileri oluşturuluyor..." },
    { text: "Marketplace uyumluluğu kontrol ediliyor..." },
    { text: "Rekabet analizi yapılıyor..." },
    { text: "SEO skoru hesaplanıyor..." },
    { text: "Analiz tamamlandı!" }
  ];

        return (
    <>
      {/* Multi-Step Loaders */}
      <MultiStepLoader 
        loadingStates={uploadLoadingStates} 
        loading={showUploadLoader} 
        duration={1400}
        loop={false}
        onComplete={() => handleLoaderComplete('upload')}
      />
      
      <MultiStepLoader 
        loadingStates={enhancementLoadingStates} 
        loading={showEnhancementLoader} 
        duration={800}
        loop={false}
        onComplete={() => handleLoaderComplete('enhancement')}
      />
      
      <MultiStepLoader 
        loadingStates={seoLoadingStates} 
        loading={showSEOLoader} 
        duration={700}
        loop={false}
        onComplete={() => handleLoaderComplete('seo')}
      />
      
      {/* Image Split Popup */}
      <ImageSplitPopup
        isOpen={showImagePopup}
        onClose={() => setShowImagePopup(false)}
        images={uploadedImages}
        title="Image Enhancement Results"
      />
      
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Yeni Ürün Oluştur</h1>
        <p className="text-muted-foreground mt-1">
          Ürün detaylarını doldurun ve AI sihirbazlarını kullanarak bireysel alanları geliştirin
              </p>
            </div>
            
      {/* AI Generation Progress */}
            {isGenerating && (
        <Card className="glass-card border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Resimlerinizin İşleniyor</span>
                <span className="text-sm text-muted-foreground">İşleniyor...</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                ✨ Resimleriniz analiz ediliyor, SEO uyumlu başlık ve açıklamalar oluşturuluyor, ürün özellikleri geliştiriliyor...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section - Left Side */}
              <div className="space-y-6">
                    {/* Product Images */}
          <Card className="glass-card relative">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Ürün Resimleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UploadZone 
                onFileSelect={handleFileSelect}
                onUploadComplete={handleUploadComplete}
                onUploadStart={handleUploadStart}
                onUploadEnd={handleUploadEnd}
                autoUpload={true}
                tags={["product", "new-listing"]}
              />

            </CardContent>
          </Card>
          
          {/* SEO Analysis Results */}
          {seoAnalysis && (
            <Card className="glass-card relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    SEO Analiz Sonuçları
                  </div>
                  <Badge variant={seoAnalysis.analysis.overallScore >= 80 ? 'default' : 'secondary'}>
                    {seoAnalysis.analysis.overallScore}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(seoAnalysis.analysis.imageAnalysis.reduce((acc, img) => acc + img.scores.quality, 0) / seoAnalysis.analysis.imageAnalysis.length)}
                    </p>
                    <p className="text-sm text-muted-foreground">Resim Kalitesi</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {seoAnalysis.analysis.seoRecommendations.keywordRecommendations.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Anahtar Kelime</p>
                  </div>
                </div>

                {/* Top Recommendations */}
                <div className="space-y-2">
                  <h4 className="font-medium">Önemli Öneriler:</h4>
                  <div className="space-y-1">
                    {seoAnalysis.analysis.imageAnalysis[0]?.improvements.slice(0, 3).map((improvement, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {improvement}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketplace Scores */}
                <div className="space-y-2">
                  <h4 className="font-medium">Marketplace Uyumluluğu:</h4>
                  <div className="space-y-2">
                    {seoAnalysis.analysis.marketplaceOptimization.slice(0, 2).map((marketplace, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{marketplace.marketplace}</span>
                        <Badge variant={marketplace.optimizationScore >= 80 ? 'default' : 'secondary'}>
                          {marketplace.optimizationScore}/100
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form Fields - Right Side */}
        <div className="space-y-6">
          {/* Product Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Ürün Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Ürün Başlığı *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ürün başlığını giriniz"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Açıklama *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ürün açıklamasını giriniz"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Fiyat ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Kategori seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="Ürün SKU"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="inventory">Stok</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={formData.inventory}
                      onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                      placeholder="Mevcut stok"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Ağırlık (g)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="Ürün ağırlığı"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dimensions">Boyutlar</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                      placeholder="Uzunluk x Genişlik x Yükseklik (cm)"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="keywords">SEO Anahtar Kelimeler</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    placeholder="Virgül ile ayrılmış anahtar kelimeler daha iyi keşfedilebilirliği sağlar"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketplace Selection */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Pazaryerlerine Yayınla</CardTitle>
              <p className="text-sm text-muted-foreground">
                Bu ürünün yayınlanacağı pazaryerlerini seçin
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {marketplaces.length > 0 ? (
                  marketplaces.map((marketplace) => (
                    <div
                      key={marketplace.name}
                      onClick={() => handleMarketplaceSelect(marketplace.name)}
                      className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                        selectedMarketplaces.includes(marketplace.name)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={marketplace.logo} 
                          alt={marketplace.name}
                          className="w-6 h-6 object-contain"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{marketplace.name}</p>
                        </div>
                        {selectedMarketplaces.includes(marketplace.name) ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-border rounded-full" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Store className="w-12 h-12 mx-auto mb-4" />
                    <p>No marketplaces configured. Please set up marketplace integrations in Settings.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePublish}
              disabled={!formData.title || !formData.price || selectedMarketplaces.length === 0 || isPublishing}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {isPublishing ? "Yayınlanıyor..." : `Pazaryerlerine Yayınla ${selectedMarketplaces.length} Pazaryer${selectedMarketplaces.length !== 1 ? 'ler' : ''}`}
            </Button>
            
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Taslak Olarak Kaydet
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}