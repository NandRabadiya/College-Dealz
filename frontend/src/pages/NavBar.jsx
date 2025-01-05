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
  import { useNavigate } from "react-router-dom";

  const NavBar = () => {
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [theme, setTheme] = useState("light");
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Track authentication dynamically
    const navigate = useNavigate();

    // Handle protected actions
    const handleProtectedAction = (action) => {
      if (!isAuthenticated) {
        navigate("./Authenticate");
      } else {
        action();
      }
    };

    // Define actions for each button
    const handlePostDeal = () => {
      handleProtectedAction(() => {
        navigate("/post-a-deal");
        console.log("Navigating to post deal");
        // Add navigation logic here
      });
    };

    const handleWishlist = () => {
      handleProtectedAction(() => {
        console.log("Navigating to wishlist");
        // Add navigation logic here
      });
    };

    const handleChat = () => {
      handleProtectedAction(() => {
        console.log("Navigating to chat");
        // Add navigation logic here
      });
    };

    const handleProfile = () => {
      handleProtectedAction(() => {
        console.log("Navigating to profile");
        // Add navigation logic here
      });
    };

    // Initialize theme from system preference or localStorage
    useEffect(() => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } else {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={isMobile ? "w-full" : ""}>
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
            <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
            <DropdownMenuItem>Latest</DropdownMenuItem>
            <DropdownMenuItem>Oldest</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
        <ThemeToggle isMobile={isMobile} />
      </div>
    );

    const SearchBar = ({ className = "" }) => (
      <div className={`relative ${className}`}>
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-8" />
      </div>
    );

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
                    <SearchBar className="w-full" />
                    <ActionButtons isMobile />
                    <div
                      className="flex items-center space-x-4 mt-4 cursor-pointer"
                      onClick={handleProfile}
                    >
                      <Avatar>
                        <AvatarImage src="/api/placeholder/32/32" />
                        <AvatarFallback>UN</AvatarFallback>
                      </Avatar>
                      <span>Profile</span>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <img src={logo} alt="Logo" className="h-8" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                {showMobileSearch ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>

            {showMobileSearch && (
              <div className="pb-4 px-2">
                <SearchBar className="w-full" />
              </div>
            )}
          </div>

          <div className="hidden lg:flex flex-col items-center py-2 space-y-4">
            <img src={logo} alt="Logo" className="h-8" />

            <div className="w-full flex items-center justify-between space-x-6">
              <NavigationItems />
              <SearchBar className="flex-1 max-w-md" />
              <ActionButtons />
              <Avatar onClick={handleProfile}>
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  export default NavBar;
