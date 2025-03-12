import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim() && location.pathname === '/') {
      onSearch(searchValue);
    }
  };

  if (location.pathname !== '/') return null;

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder={isAuthenticated ? "Search products..." : "Search is only available for logged in users"}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
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
      <Button 
        type="submit" 
        disabled={!isAuthenticated || !searchValue.trim() || isLoading}
        className="whitespace-nowrap"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : 'Search'}
      </Button>
    </form>
  );
};

export const ProductSort = ({ onSort, currentSort, isLoading }) => {
  const location = useLocation();
  const defaultSort = "postDate-desc";

  // Don't render on non-home pages
  if (location.pathname !== '/') return null;

  return (
    // <Select
    //   value={currentSort || defaultSort}
    //   onValueChange={onSort}
    //   disabled={isLoading}
    // >
    //   <SelectTrigger className="w-[180px]">
    //     <SelectValue placeholder="Sort">
    //       {isLoading ? (
    //         <div className="flex items-center">
    //           <Loader2 className="h-4 w-4 animate-spin mr-2" />
    //           <span>Sorting...</span>
    //         </div>
    //       ) : (
    //         <SelectValue />
    //       )}
    //     </SelectValue>
    //   </SelectTrigger>
    //   <SelectContent>
    //     <SelectItem value="postDate-desc">Latest First</SelectItem>
    //     <SelectItem value="postDate-asc">Oldest First</SelectItem>
    //     <SelectItem value="price-asc">Price: Low to High</SelectItem>
    //     <SelectItem value="price-desc">Price: High to Low</SelectItem>
    //     <SelectItem value="name-asc">Name: A to Z</SelectItem>
    //     <SelectItem value="name-desc">Name: Z to A</SelectItem>
    //   </SelectContent>
    // </Select>
    <Select
    value={currentSort?.toString() || defaultSort?.toString()}
    onValueChange={onSort}
    disabled={isLoading}
  >
    <SelectTrigger className="w-[180px]">
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Sorting...</span>
        </div>
      ) : (
        <SelectValue placeholder="Sort" />
      )}
    </SelectTrigger>
    <SelectContent>
      {[
        { id: "postDate-desc", name: "Latest First" },
        { id: "postDate-asc", name: "Oldest First" },
        { id: "price-asc", name: "Price: Low to High" },
        { id: "price-desc", name: "Price: High to Low" },
        { id: "name-asc", name: "Name: A to Z" },
        { id: "name-desc", name: "Name: Z to A" },
      ].map((data) => (
        <SelectItem key={data.id} value={data.id.toString()}>
          {data.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  

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
  ProductSort,
  LoadingSpinner
};