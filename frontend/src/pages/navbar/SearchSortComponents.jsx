import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from 'react-router-dom';

export const ProductSearch = ({ onSearch, isAuthenticated, isLoading, currentSearch }) => {
  const [searchValue, setSearchValue] = useState(currentSearch || "");
  const location = useLocation();

  // Reset search when navigating away from home
  useEffect(() => {
    if (location.pathname !== '/') {
      setSearchValue('');
    }
  }, [location.pathname]);

  // Update local state when prop changes
  useEffect(() => {
    if (currentSearch !== searchValue) {
      setSearchValue(currentSearch || "");
    }
  }, [currentSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim() && location.pathname === '/' && isAuthenticated) {
      onSearch(searchValue);
    }
  };

  const handleKeyDown = (e) => {
    // Check if the input has content and user pressed Enter
    if (e.key === 'Enter' && searchValue.trim() && isAuthenticated) {
      e.preventDefault();
      onSearch(searchValue);
    }
  };

  if (location.pathname !== '/') return null;

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
      <div className="relative flex-1">
        <Input
          placeholder={isAuthenticated ? "Search products and press Enter..." : "Search is only available for logged in users"}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isAuthenticated || isLoading}
          className="w-full pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 transform">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </form>
  );
};


// Export a loader component for reuse
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

export default {
  ProductSearch,
  LoadingSpinner
};