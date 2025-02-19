import React, { useEffect, useState } from "react";
import {
  Search,
  MessageCircle,
  Plus,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "../assets/photo/logo.png";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./notification/Notification";
import { ProductSearch, ProductSort } from "./SearchSortComponents";


export const AUTH_STATE_CHANGE_EVENT = 'authStateChanged';

const NavBar = ({ onSearch, onSort }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("jwt"))
  );
  const [isLoading, setIsLoading] = useState(false);
const [currentSort, setCurrentSort] = useState("postDate-desc");
const [currentSearch, setCurrentSearch] = useState("");
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("jwt");
      setIsAuthenticated(Boolean(token));
    };

    // Initial check
    checkAuth();
    // Create a storage event listener
    const handleAuthChange = () => {
      checkAuth();
    };

    // Add event listener for auth state changes
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  // Function to dispatch auth state change event
  const dispatchAuthEvent = () => {
    window.dispatchEvent(new Event("authStateChange"));
  };
  // Handle Search Change
  const handleSearch = async (query) => {
    setIsLoading(true);
    try {
      await onSearch(query);
      setCurrentSearch(query);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = async (value) => {
    setIsLoading(true);
    try {
      const [field, dir] = value.split('-');
      await onSort(field, dir);
      setCurrentSort(value);
    } finally {
      setIsLoading(false);
    }
  };
  const navigate = useNavigate();
  const location = useLocation();

  // Handle protected actions
  const handleProtectedAction = (path, action) => {
    if (!isAuthenticated) {
      navigate("/Authenticate", { state: { from: path } });
    } else {
      action();
    }
  };
  // Add notification handler
  const handleNotifications = () => {
    handleProtectedAction("/notifications", () => {
      console.log("Opening notifications");
      navigate("/notifications");
      // Add notification handling logic here
    });
  };

  // Define actions for each button
  const handlePostDeal = () => {
    handleProtectedAction("/post-a-deal", () => {
      navigate("/post-a-deal");
      console.log("Navigating to post deal");
      // Add navigation logic here
    });
  };

  const handleWishlist = () => {
    handleProtectedAction("/wishlist", () => {
      console.log("Navigating to wishlist");
      navigate("/wishlist");
      // Add navigation logic here
    });
  };

  const handleChat = () => {
    handleProtectedAction("", () => {
      console.log("Navigating to chat");
      // Add navigation logic here
    });
  };

  const handleProfile = () => {
    handleProtectedAction("/dashboard", () => {
      console.log("Navigating to profile");
      navigate("/dashboard");
      // Add navigation logic here
    });
  };

  // Handle logo click
  const handleLogoClick = () => {
    navigate('/');
  };

  // Handle login/signup
  const handleAuthClick = () => {
    navigate('/Authenticate', { state: { from: '/' } });
  };

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  // Theme toggle button component
  const ThemeToggle = ({ isMobile = false }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={isMobile ? "w-full flex justify-start" : ""}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5" />
          {isMobile && <span className="ml-2">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="h-5 w-5" />
          {isMobile && <span className="ml-2">Light Mode</span>}
        </>
      )}
    </Button>
  );
 // Shared components
 const LogoSection = ({ className = "" }) => (
  <img 
    src="/logo.png" 
    alt="Logo" 
    className={`h-8 cursor-pointer ${className}`}
    onClick={handleLogoClick}
  />
);

const AuthSection = ({ isMobile = false }) => (
  <div className={`flex items-center ${isMobile ? "w-full" : "space-x-4"}`}>
    {!isAuthenticated ? (
      <Button 
        variant="outline" 
        onClick={handleAuthClick}
        className={isMobile ? "w-full" : ""}
      >
        Login/Signup
      </Button>
    ) : (
      <Button 
        variant="ghost" 
        onClick={handleProfile}
        className={`${isMobile ? "w-full flex items-center justify-start gap-2" : "p-2"}`}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="/api/placeholder/32/32" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        {isMobile && <span>Profile</span>}
      </Button>
    )}
  </div>
);

  const NavigationItems = ({ isMobile = false }) => (
    <div
      className={`flex ${
        isMobile ? "flex-col space-y-4" : "items-center space-x-4"
      }`}
    >
      <div
        className={`${isMobile ? "w-full" : "w-[180px]"} 
        border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2.5 flex items-center justify-center`}
      >
        <Label>College</Label>
      </div>
      <ProductSort 
      onSort={handleSort} 
      currentSort={currentSort}
      isLoading={isLoading}
    />
    <ProductSearch 
      onSearch={handleSearch} 
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      currentSearch={currentSearch}
    /></div>
  );

  const ActionButtons = ({ isMobile = false }) => (
    <div
      className={`flex ${
        isMobile ? "flex-col space-y-4" : "items-center space-x-4"
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        className={isMobile ? "w-full flex justify-start" : ""}
        onClick={handleChat}
      >
        <MessageCircle className="h-5 w-5" />
        {isMobile && <span className="ml-2">Messages</span>}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={isMobile ? "w-full flex justify-start" : ""}
        onClick={handlePostDeal}
      >
        <Plus className="h-5 w-5" />
        {isMobile && <span className="ml-2">Post a Deal</span>}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={isMobile ? "w-full flex justify-start" : ""}
        onClick={handleWishlist}
      >
        <Heart className="h-5 w-5" />
        {isMobile && <span className="ml-2">Wishlist</span>}
      </Button>
      <NotificationBell>
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6" />
        </div>
      </NotificationBell>
      <ThemeToggle isMobile={isMobile} />
    </div>
  );

  // const SearchBar = ({ className = "" }) => (
  //   <div className={`relative ${className}`}>
  //     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
  //     <Input placeholder="Search..." className="pl-8" />
  //   </div>
  // );

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  <img src={logo} alt="Logo" className="h-16 mx-auto" />
                  <NavigationItems isMobile />
                  <ActionButtons isMobile />
                  
                </div>
              </SheetContent>
            </Sheet>
            <LogoSection className="flex-shrink-0" />
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <AuthSection />
            </div>
          </div>

          {showMobileSearch && (
            <div className="pb-4 px-2">
              <SearchBar className="w-full" />
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-col items-center py-2 space-y-4">
          <LogoSection />
          <div className="w-full flex items-center justify-between space-x-6">
            <NavigationItems />
            <ActionButtons />
            <AuthSection />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
