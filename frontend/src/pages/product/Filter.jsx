import React, { useState, useMemo } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter as FilterIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Categories array, no change
const categories = [
  { value: "All", label: "All" },
  { value: "Books", label: "Books" },
  { value: "Electronics", label: "Electronics" },
  { value: "Furniture", label: "Furniture" },
  { value: "Clothing", label: "Clothing" },
  { value: "Sports", label: "Sports" },
  { value: "Musical_Instruments", label: "Musical Instruments" },
  { value: "Stationery", label: "Stationery" },
  { value: "Lab_Equipment", label: "Lab Equipment" },
  { value: "Study_Materials", label: "Study Materials" },
  { value: "Hostel_Supplies", label: "Hostel Supplies" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Others", label: "Others" },
];

// Custom Slider Component, no change
const CustomSlider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className="relative flex w-full touch-none select-none items-center"
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {props.value.map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      />
    ))}
  </SliderPrimitive.Root>
));

CustomSlider.displayName = "CustomSlider";

const FilterComponent = ({
  onFilterChange,
  currentFilters,
  isFilterOpen,
  setIsFilterOpen,
  className = "",
  sortOptions,
  currentSort,
  onSortChange,
}) => {
  const [priceRange, setPriceRange] = useState([
    currentFilters?.minPrice || 0,
    currentFilters?.maxPrice || 5000,
  ]);
  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters?.categories || "All"
  );

  // Sort options
  const sortOptionsData = useMemo(
    () =>
      sortOptions || [
        { value: "postDate-desc", label: "Newest First" },
        { value: "postDate-asc", label: "Oldest First" },
        { value: "price-asc", label: "Price: Low to High" },
        { value: "price-desc", label: "Price: High to Low" },
        { value: "name-asc", label: "Name: A-Z" },
        { value: "name-desc", label: "Name: Z-A" },
      ],
    [sortOptions]
  );

  const handleSliderChange = (value) => {
    setPriceRange(value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    onFilterChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      categories: selectedCategory === "All" ? "" : selectedCategory,
    });
    // Close mobile filter sheet if it's open
    if (setIsFilterOpen) {
      setIsFilterOpen(false);
    }
  };

  const clearFilters = () => {
    // Reset filters
    setPriceRange([0, 5000]);
    setSelectedCategory("All");

    // Apply filter changes
    onFilterChange({
      minPrice: 0,
      maxPrice: 5000,
      categories: "",
    });

    // Reset sort to "Newest First"
    if (onSortChange) {
      onSortChange("postDate-desc");
    }

    // Close mobile filter sheet
    if (setIsFilterOpen) {
      setIsFilterOpen(false);
    }
  };

  // Desktop filter panel that includes both filters and sort options
  const DesktopFilterPanel = () => (
    <div className="space-y-6">
      {/* Sort Section */}
      <div>
        <h3 className="font-medium mb-4">Sort By</h3>
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptionsData.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Price Range Section - Simplified with just the slider */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <CustomSlider
            value={priceRange}
            min={0}
            max={5000}
            step={10}
            onValueChange={handleSliderChange}
            className="w-full"
          />
          {/* Display current price range values */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div>
        <h3 className="font-medium mb-4">Category</h3>
        <ScrollArea className="h-[200px] pr-4">
          <RadioGroup
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            className="space-y-2"
          >
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={category.value}
                  id={`desktop-${category.value}`}
                />
                <Label
                  htmlFor={`desktop-${category.value}`}
                  className="text-sm cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply
        </Button>
        <Button variant="outline" onClick={clearFilters} className="flex-1">
          Clear All
        </Button>
      </div>
    </div>
  );

  // Mobile filter panel that includes ONLY filters (not sort)
  const MobileFilterPanel = () => (
    <div className="space-y-6">
      {/* Price Range Section - Simplified with just the slider */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <CustomSlider
            value={priceRange}
            min={0}
            max={5000}
            step={10}
            onValueChange={handleSliderChange}
            className="w-full"
          />
          {/* Display current price range values */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div>
        <h3 className="font-medium mb-4">Category</h3>
        <ScrollArea className="h-[200px] pr-4">
          <RadioGroup
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            className="space-y-2"
          >
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={category.value}
                  id={`mobile-${category.value}`}
                />
                <Label
                  htmlFor={`mobile-${category.value}`}
                  className="text-sm cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply
        </Button>
        <Button variant="outline" onClick={clearFilters} className="flex-1">
          Clear All
        </Button>
      </div>
    </div>
  );

  // Determine if there are active filters
  const hasActiveFilters = useMemo(() => {
    return (
      (currentFilters?.categories && currentFilters.categories !== "") ||
      (currentFilters?.minPrice && currentFilters.minPrice > 0) ||
      (currentFilters?.maxPrice && currentFilters.maxPrice < 5000)
    );
  }, [currentFilters]);

  return (
    <>
      {/* Mobile filter sheet (without sort) */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="left" className="w-full sm:max-w-lg">
          <div className="h-full py-6 px-4">
            <MobileFilterPanel />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar for larger screens (includes both filter and sort) */}
      <div className={`hidden lg:block w-64 shrink-0 ${className}`}>
        <DesktopFilterPanel />
      </div>
    </>
  );
};

export default FilterComponent;
