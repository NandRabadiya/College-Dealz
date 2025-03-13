import React from "react";
import { ProductSearch, ProductSort } from "./SearchSortComponents";

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
      <ProductSort
        onSort={(value) => {
          handleSort(value);
          onItemClick && onItemClick();
        }}
        currentSort={currentSort}
        isLoading={isLoading}
      />
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