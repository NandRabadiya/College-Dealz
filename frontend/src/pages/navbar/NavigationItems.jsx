import React from "react";
import { ProductSearch } from "./SearchSortComponents";

const NavigationItems = ({ 
  isMobile = false, 
  onItemClick, 
  handleSearch, 
  handleSort, 
  isAuthenticated, 
  isLoading, 
  currentSearch, 
  currentSort 
}) => {
  if (isMobile) return null;

  return (
    <div className="flex items-center space-x-6">
      <ProductSearch
        onSearch={(query) => {
          handleSearch(query);
          onItemClick && onItemClick();
        }}
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        currentSearch={currentSearch}
      />
    </div>
  );
};

export default NavigationItems;