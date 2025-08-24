import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Plus,
  Bell,
  Search,
  User,
  LogOut,
  Shield,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/animated-sidebar";
import { motion } from "motion/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayoutAnimated({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Generate user initials
  const getUserInitials = () => {
    if (!user?.firstName || !user?.lastName) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Get role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  // Navigation links for animated sidebar
  const navigationLinks = [
    {
      label: "Stox AI",
      href: "/ai",
      icon: <Bot className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Products",
      href: "/products",
      icon: <Package className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Orders",
      href: "/orders",
      icon: <ShoppingCart className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: <BarChart3 className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5 shrink-0" />,
    },
  ];

  // Logo components for the animated sidebar
  const Logo = () => {
    return (
      <Link
        to="/"
        className="relative z-20 flex items-center space-x-3 py-1 text-sm font-normal"
      >
        <img src="/logo.png" alt="Stox" className="h-8 w-auto" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-gotham-black text-xl whitespace-pre text-foreground"
        >
          Stox
        </motion.span>
      </Link>
    );
  };

  const LogoIcon = () => {
    return (
      <Link
        to="/"
        className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
      >
        <img src="/logo.png" alt="Stox" className="h-8 w-auto" />
      </Link>
    );
  };

  // Custom SidebarLink component that handles active state
  const CustomSidebarLink = ({ link }: { link: typeof navigationLinks[0] }) => {
    const active = isActive(link.href);
    
    return (
      <Link
        to={link.href}
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg transition-all duration-200",
          active 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className={cn(
          "transition-colors",
          active ? "text-primary" : "text-muted-foreground"
        )}>
          {link.icon}
        </div>
        <motion.span
          animate={{
            display: sidebarOpen ? "inline-block" : "none",
            opacity: sidebarOpen ? 1 : 0,
          }}
          className={cn(
            "text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
            active ? "font-medium text-primary" : "text-foreground"
          )}
        >
          {link.label}
        </motion.span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background-soft flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10 bg-background border-r border-border/50">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {navigationLinks.map((link, idx) => (
                <CustomSidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          
          {/* User section at bottom */}
          <div className="border-t border-border/50 pt-4">
            {/* Quick action button */}
            <div className="mb-4">
              <Button 
                className={cn(
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  sidebarOpen ? "w-full" : "w-8 h-8 p-0"
                )}
                size={sidebarOpen ? "sm" : "icon"}
                asChild
              >
                <Link to="/products/new" className="flex items-center justify-center">
                  <Plus className={cn("w-4 h-4", sidebarOpen && "mr-2")} />
                  <motion.span
                    animate={{
                      display: sidebarOpen ? "inline-block" : "none",
                      opacity: sidebarOpen ? 1 : 0,
                    }}
                    className="whitespace-nowrap"
                  >
                    Yeni Ürün
                  </motion.span>
                </Link>
              </Button>
            </div>
            
            {/* User info */}
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors",
              !sidebarOpen && "justify-center"
            )}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="" alt={user?.firstName || 'User'} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <motion.div 
                className="flex flex-col min-w-0 overflow-hidden"
                animate={{
                  width: sidebarOpen ? "auto" : "0px",
                  opacity: sidebarOpen ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ display: sidebarOpen ? "flex" : "none" }}
              >
                <span className="text-sm font-medium text-foreground truncate whitespace-nowrap">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground truncate whitespace-nowrap">
                  {user?.email}
                </span>
              </motion.div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 min-w-0 transition-all duration-300 ease-smooth">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - Search */}
            <div className="flex items-center flex-1">
              {/* Search */}
              <div className="relative w-80 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Ürünleri ara..."
                  className="pl-10 bg-background-muted/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Right side - Notifications + User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-xs text-accent-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user?.firstName || 'User'} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-background border border-border shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Badge variant={getRoleBadgeVariant(user?.role || 'user')} className="text-xs">
                          {user?.role}
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Profile */}
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                    <User className="mr-2 h-4 w-4 text-foreground" />
                    <span className="text-foreground font-medium">Profil</span>
                  </DropdownMenuItem>
                  
                  {/* Settings */}
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent">
                    <Link to="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4 text-foreground" />
                      <span className="text-foreground font-medium">Ayarlar</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin Panel (only for admins) */}
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent">
                      <Link to="/admin" className="flex items-center w-full">
                        <Shield className="mr-2 h-4 w-4 text-foreground" />
                        <span className="text-foreground font-medium">Yönetim Paneli</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Logout */}
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
