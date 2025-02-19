import React, { useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter as FilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const categories = [
  "All", "Books", "Electronics", "Furniture", "Clothing", 
  "Sports Equipment", "Musical Instruments", "Art Supplies",
  "Lab Equipment", "Study Materials", "Others"
];

// Custom Slider Component
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

const FilterComponent = ({ onFilterChange,currentFilters, className = "" }) => {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minInputValue, setMinInputValue] = useState("0");
  const [maxInputValue, setMaxInputValue] = useState("5000");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: currentFilters?.minPrice || "",
    maxPrice: currentFilters?.maxPrice || "",
    categories: currentFilters?.categories || "",
  });

  const handleSliderChange = (value) => {
    setPriceRange(value);
    setMinInputValue(value[0].toString());
    setMaxInputValue(value[1].toString());
  };

  const handleMinInputChange = (e) => {
    const value = e.target.value;
    setMinInputValue(value);
    
    if (value === "") return;
    
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const maxValue = Math.max(numValue, priceRange[1]);
      setPriceRange([numValue, maxValue]);
      if (maxValue !== priceRange[1]) {
        setMaxInputValue(maxValue.toString());
      }
    }
  };

  const handleMaxInputChange = (e) => {
    const value = e.target.value;
    setMaxInputValue(value);
    
    if (value === "") return;
    
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const minValue = Math.min(numValue, priceRange[0]);
      setPriceRange([minValue, numValue]);
      if (minValue !== priceRange[0]) {
        setMinInputValue(minValue.toString());
      }
    }
  };

  const handleInputBlur = (type) => {
    const value = type === 'min' ? minInputValue : maxInputValue;
    if (value === "") {
      const defaultValue = type === 'min' ? "0" : "10000";
      if (type === 'min') {
        setMinInputValue(defaultValue);
      } else {
        setMaxInputValue(defaultValue);
      }
      return;
    }

    let numValue = Number(value);
    numValue = Math.max(0, Math.min(5000, numValue));
    
    if (type === 'min') {
      setMinInputValue(numValue.toString());
      setPriceRange([numValue, Math.max(numValue, priceRange[1])]);
    } else {
      setMaxInputValue(numValue.toString());
      setPriceRange([Math.min(numValue, priceRange[0]), numValue]);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const applyFilters = (e) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 5000,
      categories: selectedCategory === "All" ? "" : filters.categories
    });
    setIsOpen(false);
  };

  const clearFilters = () => {
    setPriceRange([0, 5000]);
    setMinInputValue("0");
    setMaxInputValue("5000");
    setSelectedCategory("All");
    onFilterChange({
      minPrice: 0,
      maxPrice: 5000,
      categories: ""
    });
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="min-price">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                value={minInputValue}
                onChange={handleMinInputChange}
                onBlur={() => handleInputBlur('min')}
                min={0}
                max={5000}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="max-price">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                value={maxInputValue}
                onChange={handleMaxInputChange}
                onBlur={() => handleInputBlur('max')}
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
                <RadioGroupItem value={category} id={category} />
                <Label htmlFor={category} className="text-sm cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
      </div>

      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters} className="flex-1">
          Clear All
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sheet for smaller screens */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden mb-4">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {selectedCategory !== "All" && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-lg">
          <div className="h-full py-6 px-4">
            <FilterPanel />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar for larger screens */}
      <div className={`hidden lg:block w-64 shrink-0 ${className}`}>
        <FilterPanel />
      </div>
    </>
  );
};

export default FilterComponent;