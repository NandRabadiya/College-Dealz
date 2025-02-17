import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import debounce from "lodash/debounce";

export const ProductSearch = ({ onSearch }) => {
  // Debounce the search callback
  const debouncedSearch = React.useCallback(
    debounce((value) => {
      console.log("Search triggered with:", value);
      onSearch(value);
    }, 500),
    [onSearch]
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div className="relative w-full max-w-sm">
      <Input
        placeholder="Search products..."
        onChange={(e) => {
          console.log("Search input changed:", e.target.value);
          debouncedSearch(e.target.value);
        }}
        className="w-full pl-10" // Add padding for the search icon
      />
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
    </div>
  );
};

export const ProductSort = ({ onSort }) => {
  return (
    <Select
      onValueChange={(value) => {
        console.log("Sort changed:", value);
        const [field, dir] = value.split("-");
        onSort(field, dir);
      }}
    >
      {" "}
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="postDate-desc">Newest First</SelectItem>
        <SelectItem value="postDate-asc">Oldest First</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="name-asc">Name: A to Z</SelectItem>
        <SelectItem value="name-desc">Name: Z to A</SelectItem>
      </SelectContent>
    </Select>
  );
};
