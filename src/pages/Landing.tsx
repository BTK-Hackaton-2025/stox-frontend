import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload, Sparkles, Zap, Target, BarChart3, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-dashboard.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">SwiftSell</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/products/new">
                <Button variant="hero" size="sm">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered Marketplace
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Sell everywhere with{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    one click
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload a photo, let AI polish it and generate SEO copy, then publish to Amazon, Trendyol, and Hepsiburada instantly. 
                  The future of marketplace selling is here.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products/new">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Start Selling Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="glass" size="xl" className="w-full sm:w-auto">
                    View Dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">90s</div>
                  <div className="text-sm text-muted-foreground">Upload to Live</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Marketplaces</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">AI Generated</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary/20 rounded-3xl blur-3xl"></div>
              <Card className="relative border-0 shadow-large overflow-hidden">
                <img 
                  src={heroImage} 
                  alt="SwiftSell Dashboard Preview" 
                  className="w-full h-auto rounded-lg"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t bg-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Target className="h-3 w-3 mr-1" />
              Core Features
            </Badge>
            <h2 className="text-4xl font-bold">Everything you need to dominate marketplaces</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI-powered content generation to real-time publishing across multiple platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Smart Upload</h3>
                <p className="text-muted-foreground">
                  Drag and drop your product photos. Our AI automatically enhances, crops, and optimizes them for each marketplace.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold">AI Content Generation</h3>
                <p className="text-muted-foreground">
                  Generate compelling titles, descriptions, and SEO keywords that convert. Each marketplace gets optimized copy.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Instant Publishing</h3>
                <p className="text-muted-foreground">
                  Publish to Amazon, Trendyol, and Hepsiburada simultaneously. Real-time status updates keep you informed.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Track performance across all marketplaces. See what's working and optimize your strategy.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Secure & Reliable</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with 99.9% uptime. Your data and listings are always protected.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Marketplace Optimization</h3>
                <p className="text-muted-foreground">
                  Each marketplace has unique requirements. We handle all the formatting and compliance automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              Ready to revolutionize your selling?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of sellers who've already made the switch to intelligent marketplace management.
            </p>
            <Link to="/products/new">
              <Button variant="hero" size="xl">
                Start Your First Listing
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-accent/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-gradient-primary flex items-center justify-center">
                <Zap className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">SwiftSell</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 SwiftSell. The future of marketplace selling.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;