import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductGallery = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageList = images?.length > 0 
    ? images 
    : [{ id: 'placeholder', url: '/api/placeholder/400/320', fileName: 'placeholder' }];

  const handlePrevious = () => {
    setSelectedIndex((current) => (current === 0 ? imageList.length - 1 : current - 1));
  };

  const handleNext = () => {
    setSelectedIndex((current) => (current === imageList.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="w-full flex flex-col items-center space-y-3">
      {/* Main Image Container */}
      <div className="relative w-full h-auto overflow-hidden rounded-lg">
        <div className="aspect-square w-full flex items-center justify-center bg-background">
          <img
            src={imageList[selectedIndex]?.url}
            alt={`Product image ${selectedIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          
          />
        </div>
        
        {/* Navigation arrows - only show if there are multiple images */}
        {imageList.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-8 w-8"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-8 w-8"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto w-full justify-center pb-1">
          {imageList.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border ${
                selectedIndex === index ? 'ring-2 ring-primary ring-offset-1' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="w-full h-full flex items-center justify-center bg-background">
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="max-h-full max-w-full object-contain"
                 
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;