import React from "react";
import { ArrowLeft, ArrowRight, Wand2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import UploadZone from "@/components/upload-zone";
import MarketplaceCard from "@/components/marketplace-card";

const steps = [
  { id: 1, name: "Upload", description: "Add product images" },
  { id: 2, name: "Edit", description: "Review & optimize" },
  { id: 3, name: "Publish", description: "Launch to marketplaces" }
];

const marketplaces = [
  {
    name: "Amazon",
    logo: "/api/placeholder/32/32",
    status: "draft" as const
  },
  {
    name: "Trendyol", 
    logo: "/api/placeholder/32/32",
    status: "draft" as const
  },
  {
    name: "Hepsiburada",
    logo: "/api/placeholder/32/32", 
    status: "draft" as const
  }
];

export default function NewProduct() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [files, setFiles] = React.useState<File[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    price: "",
    category: "",
    keywords: ""
  });

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const generateAIContent = async () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setFormData({
        title: "Premium Wireless Bluetooth Headphones with Noise Cancellation",
        description: "Experience superior sound quality with these premium wireless headphones featuring advanced noise cancellation technology. Perfect for music lovers, commuters, and professionals who demand the best audio experience.",
        price: "89.99",
        category: "Electronics > Audio > Headphones",
        keywords: "wireless headphones, bluetooth, noise cancelling, premium audio, comfortable fit"
      });
      setIsGenerating(false);
    }, 3000);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Upload Product Images</h2>
              <p className="text-muted-foreground">
                Add high-quality images of your product. Our AI will enhance and optimize them automatically.
              </p>
            </div>
            
            <UploadZone onFileSelect={handleFileSelect} />
            
            {files.length > 0 && (
              <div className="flex justify-center">
                <Button onClick={generateAIContent} disabled={isGenerating} size="lg">
                  <Wand2 className="w-5 h-5 mr-2" />
                  {isGenerating ? "Generating AI Content..." : "Generate Product Details"}
                </Button>
              </div>
            )}
            
            {isGenerating && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Processing</span>
                      <span className="text-sm text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing images and generating optimized product content...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Review & Edit Product Details</h2>
              <p className="text-muted-foreground">
                AI has generated optimized content. Review and customize as needed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Product Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Enter product title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Product description"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="Product category"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="keywords">Keywords</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                        placeholder="Comma-separated keywords"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Preview */}
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {files.length > 0 && (
                      <div className="space-y-4">
                        <div className="aspect-square bg-background-muted rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(files[0])}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{formData.title || "Product Title"}</h3>
                          <p className="text-2xl font-bold text-primary mt-1">
                            ${formData.price || "0.00"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {formData.description || "Product description will appear here..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Publish to Marketplaces</h2>
              <p className="text-muted-foreground">
                Choose where to publish your product. Real-time status updates will appear below.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketplaces.map((marketplace, index) => (
                <MarketplaceCard
                  key={index}
                  name={marketplace.name}
                  logo={marketplace.logo}
                  status={marketplace.status}
                />
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button size="xl" className="btn-accent">
                <Save className="w-5 h-5 mr-2" />
                Publish Product
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center space-x-3 ${
              currentStep >= step.id ? "text-primary" : "text-muted-foreground"
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step.id}
              </div>
              <div>
                <p className="font-medium">{step.name}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.id ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="animate-fade-in">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={nextStep}
          disabled={currentStep === 3 || (currentStep === 1 && files.length === 0)}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}