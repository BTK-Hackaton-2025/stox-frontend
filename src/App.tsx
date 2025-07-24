import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewProduct from "./pages/NewProduct";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard-layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products/new" element={
            <DashboardLayout>
              <NewProduct />
            </DashboardLayout>
          } />
          <Route path="/products" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Products</h1>
                <p className="text-muted-foreground">Product management coming soon...</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/orders" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Orders</h1>
                <p className="text-muted-foreground">Order management coming soon...</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/reports" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Reports</h1>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </div>
            </DashboardLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
