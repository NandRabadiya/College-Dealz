import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "../../assets/photo/logo.png";
import lightLogo from "../../assets/photo/logo-light.png";
import darkLogo from "../../assets/photo/logo-dark.png";

// Import the new components
import ThemeToggle from "./ThemeToggle";
import LogoSection from "./LogoSection";
import ActionButtons from "./ActionButtons";
import AuthSection from "./AuthSection";
import NavigationItems from "./NavigationItems";
import MobileSearchAndFilter from "./MobileSearchAndFilter";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";

export const AUTH_STATE_CHANGE_EVENT = "authStateChanged";

const NavBar = ({ onSearch, onSort, onFilterChange }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("jwt"))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentSort, setCurrentSort] = useState("postDate-desc");
  const [currentSearch, setCurrentSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    categories: "",
  });
  const [scrolled, setScrolled] = useState(false);

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      const [field, dir] = value.split("-");
      await onSort(field, dir);
      setCurrentSort(value);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setCurrentFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
    setShowMobileFilter(false);
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
    setIsSidebarOpen(false);
  };
  
  // Add notification handler
  const handleNotifications = () => {
    handleProtectedAction("/notifications", () => {
      console.log("Opening notifications");
      navigate("/notifications");
    });
  };

  // Define actions for each button
  const handlePostDeal = () => {
    handleProtectedAction("/post-a-deal", () => {
      navigate("/post-a-deal");
      console.log("Navigating to post deal");
    });
  };

  const handleWishlist = () => {
    handleProtectedAction("/wishlist", () => {
      console.log("Navigating to wishlist");
      navigate("/wishlist");
    });
  };

  const handleWantlist = () => {
    handleProtectedAction("/wantlist", () => {
      console.log("Navigating to wantlist");
      navigate("/wantlist");
    });
  };
  
  const handleChat = () => {
    handleProtectedAction("", () => {
      console.log("Navigating to chat");
      navigate("/chats");
    });
  };

  const handleProfile = () => {
    handleProtectedAction("/dashboard", () => {
      console.log("Navigating to profile");
      navigate("/dashboard");
    });
  };

  // Handle logo click
  const handleLogoClick = () => {
    navigate("/");
    setIsSidebarOpen(false);
  };

  // Handle login/signup
  const handleAuthClick = () => {
    navigate("/Authenticate", { state: { from: "/" } });
    setIsSidebarOpen(false);
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
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };
  return (
    <>
      <nav className={cn(
        "w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50",
        scrolled && "shadow-subtle"
      )}>
        <div className="max-w-7xl mx-auto px-4">
          {/* MOBILE VIEW */}<MobileHeader 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            logo={theme === "dark" ? darkLogo : lightLogo}
            handleLogoClick={handleLogoClick}
            handleWantlist={handleWantlist}
            theme={theme}
            toggleTheme={toggleTheme}
            isAuthenticated={isAuthenticated}
            handleAuthClick={handleAuthClick}
            handleProfile={handleProfile}
            handleChat={handleChat}
            handlePostDeal={handlePostDeal}
            handleWishlist={handleWishlist}
          />

          {/* DESKTOP VIEW */}
          <DesktopHeader 
          logo={theme === "dark" ? darkLogo : lightLogo}
          handleLogoClick={handleLogoClick}
            handleSearch={handleSearch}
            handleSort={handleSort}
            handleChat={handleChat}
            handlePostDeal={handlePostDeal}
            handleWishlist={handleWishlist}
            handleWantlist={handleWantlist}
            theme={theme}
            toggleTheme={toggleTheme}
            isAuthenticated={isAuthenticated}
            handleAuthClick={handleAuthClick}
            handleProfile={handleProfile}
            isLoading={isLoading}
            currentSort={currentSort}
            currentSearch={currentSearch}
          />
        </div>
      </nav>
      <MobileSearchAndFilter 
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        handleSearch={handleSearch}
        handleSort={handleSort}
        handleFilterChange={handleFilterChange}
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        currentSearch={currentSearch}
        currentSort={currentSort}
        currentFilters={currentFilters}
      />
    </>
  );
};

export default NavBar;
