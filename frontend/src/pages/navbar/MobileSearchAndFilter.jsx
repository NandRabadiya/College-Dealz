import React from "react";
import { Filter, X } from "lucide-react";
import { ProductSearch } from "./SearchSortComponents";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileSearchAndFilter = ({ 
  handleSearch, 
  isAuthenticated, 
  isLoading, 
  currentSearch, 
}) => {
  return (
    <div className="lg:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto px-2 sm:px-10 md:px-10 py-2 sm:py-2.5 md:py-3">
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          <div className="flex-1 relative">
            <ProductSearch
              onSearch={handleSearch}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              currentSearch={currentSearch}
              className="w-full"
              placeholder="Search products..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSearchAndFilter;