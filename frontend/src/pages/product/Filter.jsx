import React, { useState, useMemo } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter as FilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  "All",
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports",
  "Musical Instruments",
  "Stationery",
  "Lab Equipment",
  "Study Materials",
  "Hostel Supplies",
  "Vehicles",
  "Others",
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
  const [minInputValue, setMinInputValue] = useState(
    (currentFilters?.minPrice || 0).toString()
  );
  const [maxInputValue, setMaxInputValue] = useState(
    (currentFilters?.maxPrice || 5000).toString()
  );
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
    setMinInputValue(value[0].toString());
    setMaxInputValue(value[1].toString());
  };

  const handleMinInputChange = (e) => {
    setMinInputValue(e.target.value);
  };

  const handleMaxInputChange = (e) => {
    setMaxInputValue(e.target.value);
  };

  const handleMinInputBlur = () => {
    setTimeout(() => {
      let value = minInputValue;
      if (value === "" || isNaN(Number(value))) {
        value = "0";
        setMinInputValue(value);
      }

      const numValue = Math.max(0, Math.min(5000, Number(value)));
      setMinInputValue(numValue.toString());
      setPriceRange([numValue, Math.max(numValue, priceRange[1])]);
    }, 1000); // Wait for 1000ms before updating
  };

  const handleMaxInputBlur = () => {
    setTimeout(() => {
      let value = maxInputValue;
      if (value === "" || isNaN(Number(value))) {
        value = "5000";
        setMaxInputValue(value);
      }

      const numValue = Math.max(0, Math.min(5000, Number(value)));
      setMaxInputValue(numValue.toString());
      setPriceRange([Math.min(numValue, priceRange[0]), numValue]);
    }, 1000); // Wait for 1000ms before updating
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    onFilterChange({
      minPrice: parseInt(minInputValue, 10),
      maxPrice: parseInt(maxInputValue, 10),
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
    setMinInputValue("0");
    setMaxInputValue("5000");
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

      {/* Price Range Section */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="min-price-desktop">Min Price</Label>
              <Input
                id="min-price-desktop"
                type="number"
                value={minInputValue}
                onChange={handleMinInputChange}
                onBlur={handleMinInputBlur}
                min={0}
                max={5000}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="max-price-desktop">Max Price</Label>
              <Input
                id="max-price-desktop"
                type="number"
                value={maxInputValue}
                onChange={handleMaxInputChange}
                onBlur={handleMaxInputBlur}
                min={0}
                max={5000}
                className="mt-1"
              />
            </div>
          </div>
          <CustomSlider
            value={priceRange}
            min={0}
            max={5000}
            step={10}
            onValueChange={handleSliderChange}
            className="w-full"
          />
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
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={`desktop-${category}`} />
                <Label htmlFor={`desktop-${category}`} className="text-sm cursor-pointer">
                  {category}
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
      {/* Price Range Section */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="min-price-mobile">Min Price</Label>
              <Input
                id="min-price-mobile"
                type="number"
                value={minInputValue}
                onChange={handleMinInputChange}
                onBlur={handleMinInputBlur}
                min={0}
                max={5000}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="max-price-mobile">Max Price</Label>
              <Input
                id="max-price-mobile"
                type="number"
                value={maxInputValue}
                onChange={handleMaxInputChange}
                onBlur={handleMaxInputBlur}
                min={0}
                max={5000}
                className="mt-1"
              />
            </div>
          </div>
          <CustomSlider
            value={priceRange}
            min={0}
            max={5000}
            step={10}
            onValueChange={handleSliderChange}
            className="w-full"
          />
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
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={`mobile-${category}`} />
                <Label htmlFor={`mobile-${category}`} className="text-sm cursor-pointer">
                  {category}
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