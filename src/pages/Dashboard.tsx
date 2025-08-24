import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Package, ShoppingCart, TrendingUp, Plus, Eye, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MarketplaceCard from "@/components/marketplace-card";
import StatusBadge, { StatusType } from "@/components/status-badge";
import heroImage from "@/assets/hero-dashboard.jpg";

interface Product {
  id: string;
  name: string;
  image: string;
  status: StatusType;
  marketplaces: number;
  lastUpdate: string;
}

interface Marketplace {
  name: string;
  logo: string;
  status: StatusType;
  url?: string;
  error?: string;
  lastSync?: string;
}

// TODO: Replace with API calls to fetch real data
const recentProducts: Product[] = [];
const marketplaces: Marketplace[] = [];
const stats = {
  totalProducts: 0,
  publishedProducts: 0,
  totalOrders: 0,
  revenue: 0
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary rounded-lg p-8 text-primary-foreground">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">
            <span className="font-gotham-black">Stox</span>'a Hoş Geldiniz
          </h1>
          <p className="text-primary-foreground/90 text-lg mb-6">
            Yapay zeka destekli optimizasyon ile ürünlerinizi birden fazla pazaryerinde yayınlamak için tek durak kontrol paneliniz.
          </p>
          <div className="flex items-center space-x-4">
            <Button variant="accent" size="lg" asChild>
              <Link to="/products/new">
                <Plus className="w-5 h-5 mr-2" />
                Yeni Ürün Oluştur
              </Link>
            </Button>
            <Button variant="glass" size="lg">
              <Eye className="w-5 h-5 mr-2" />
              Demo İzle
            </Button>
          </div>
        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Son ay için +{stats.totalProducts > 0 ? Math.floor(stats.totalProducts * 0.1) : 0}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yayınlanmış</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts > 0 ? Math.round((stats.publishedProducts / stats.totalProducts) * 100) : 0}% başarı oranı
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Son hafta için +{stats.totalOrders > 0 ? Math.floor(stats.totalOrders * 0.12) : 0}%
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gelir</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Son ay için +{stats.revenue > 0 ? Math.floor(stats.revenue * 0.08) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Son Ürünler</h2>
            <Button variant="outline" size="sm">Tümünü Görüntüle</Button>
          </div>
          
          <div className="space-y-4">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <Card key={product.id} className="glass-card hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-background-muted rounded-lg overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={product.status} />
                          <Badge variant="outline" className="text-xs">
                            {product.marketplaces} marketplaces
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Updated {product.lastUpdate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Henüz ürün yok</h3>
                  <p className="text-muted-foreground mb-4">
                    İlk ürününüzü oluşturmak için başlayın
                  </p>
                  <Button asChild>
                    <Link to="/products/new">Ürün Oluştur</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Marketplace Status */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pazaryerleri Durumu</h2>
            <Button variant="outline" size="sm">Yönet</Button>
          </div>
          
          <div className="space-y-4">
            {marketplaces.length > 0 ? (
              marketplaces.map((marketplace, index) => (
                <MarketplaceCard
                  key={index}
                  name={marketplace.name}
                  logo={marketplace.logo}
                  status={marketplace.status}
                  url={marketplace.url}
                  error={marketplace.error}
                  lastSync={marketplace.lastSync}
                />
              ))
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Pazaryeri entegrasyonu yok</h3>
                  <p className="text-muted-foreground mb-4">
                    Pazaryerlerini bağlamak için ayarları yapılandırın
                  </p>
                  <Button asChild>
                    <Link to="/settings">Ayarlara Git</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}