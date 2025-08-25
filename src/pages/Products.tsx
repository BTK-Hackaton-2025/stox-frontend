import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import type {
  MockECommerceProduct,
  CreateProductRequest,
  UpdateProductRequest,
  MarketplaceInfo,
} from "@/types/products";

const marketplaces: MarketplaceInfo[] = [
  {
    id: "amazon",
    name: "Amazon",
    logo: "/placeholder.svg",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "hepsiburada",
    name: "Hepsiburada",
    logo: "/placeholder.svg",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "trendyol",
    name: "Trendyol",
    logo: "/placeholder.svg",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "mockecommerce",
    name: "MockECommerce",
    logo: "/placeholder.svg",
    isAvailable: true,
    comingSoon: false,
  },
];

const categories = [
  { id: "f872e4e4-8289-4d3f-a28a-6713d87100c9", name: "Elektronik" },
  { id: "0e174546-4c38-4a68-91d4-8596785e418e", name: "Electronics" },
];

export default function Products() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(
    null
  );
  const [products, setProducts] = useState<MockECommerceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<MockECommerceProduct | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState<CreateProductRequest>({
    title: "",
    description: "",
    price: 0,
    categoryId: categories[0].id,
  });

  const [editProduct, setEditProduct] = useState<UpdateProductRequest>({
    title: "",
    description: "",
    price: 0,
    categoryId: categories[0].id,
    stock: 0,
  });

  const fetchProducts = useCallback(async () => {
    if (selectedMarketplace !== "mockecommerce") return;

    setLoading(true);
    try {
      const response = await apiClient.getExternalProducts();
      setProducts(response.data || []);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMarketplace, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async () => {
    try {
      await apiClient.createExternalProduct(newProduct);
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla oluşturuldu.",
      });
      setIsCreateDialogOpen(false);
      setNewProduct({
        title: "",
        description: "",
        price: 0,
        categoryId: categories[0].id,
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürün oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Error creating product:", error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      await apiClient.updateExternalProduct(selectedProduct.id, editProduct);
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi.",
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürün güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      await apiClient.deleteExternalProduct(productId);
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi.",
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürün silinirken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Error deleting product:", error);
    }
  };

  const openEditDialog = (product: MockECommerceProduct) => {
    setSelectedProduct(product);
    setEditProduct({
      title: product.title || product.name || "",
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      stock: product.stock || 0,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
      </div>

      {/* Marketplace Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketplaces.map((marketplace) => (
          <Card
            key={marketplace.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMarketplace === marketplace.id
                ? "ring-2 ring-primary border-primary"
                : ""
            } ${!marketplace.isAvailable ? "opacity-50" : ""}`}
            onClick={() => {
              if (marketplace.isAvailable) {
                setSelectedMarketplace(marketplace.id);
              }
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center p-1">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{marketplace.name}</span>
                </div>
                {marketplace.comingSoon && (
                  <Badge variant="secondary">Yakında</Badge>
                )}
                {marketplace.isAvailable && (
                  <Badge variant="default">Aktif</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {marketplace.comingSoon
                  ? "Bu marketplace yakında kullanıma açılacak"
                  : marketplace.isAvailable
                  ? "Ürün yönetimi için tıklayın"
                  : "Şu anda kullanılamıyor"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MockECommerce Product Management */}
      {selectedMarketplace === "mockecommerce" && (
        <>
          <Separator />

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">MockECommerce Ürünleri</h2>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Ürün Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Ürün Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Ürün Başlığı</Label>
                    <Input
                      id="title"
                      value={newProduct.title}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, title: e.target.value })
                      }
                      placeholder="Ürün başlığını girin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      placeholder="Ürün açıklamasını girin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Fiyat</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={newProduct.categoryId}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateProduct} className="w-full">
                    Ürün Oluştur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="text-center py-12">
              <p>Ürünler yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz ürün yok</h3>
              <p className="text-muted-foreground mb-4">
                İlk ürününüzü oluşturmak için "Yeni Ürün Ekle" butonuna
                tıklayın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {product.title || product.name || "Başlıksız Ürün"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        ₺{product.price}
                      </span>
                      {product.stock !== undefined && (
                        <Badge variant="outline">Stok: {product.stock}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ürün Düzenle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Ürün Başlığı</Label>
                  <Input
                    id="edit-title"
                    value={editProduct.title}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, title: e.target.value })
                    }
                    placeholder="Ürün başlığını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Açıklama</Label>
                  <Textarea
                    id="edit-description"
                    value={editProduct.description}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Ürün açıklamasını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Fiyat</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stok</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editProduct.stock || 0}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Kategori</Label>
                  <Select
                    value={editProduct.categoryId}
                    onValueChange={(value) =>
                      setEditProduct({ ...editProduct, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleUpdateProduct} className="w-full">
                  Ürünü Güncelle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Other Marketplaces */}
      {selectedMarketplace && selectedMarketplace !== "mockecommerce" && (
        <>
          <Separator />
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {marketplaces.find((m) => m.id === selectedMarketplace)?.name}{" "}
              Entegrasyonu
            </h3>
            <p className="text-muted-foreground">
              Bu marketplace entegrasyonu yakında kullanıma açılacak.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
