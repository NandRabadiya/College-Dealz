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
    <div className="relative w-full h-full flex flex-col items-center space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full max-w-xs md:max-w-sm lg:max-w-md h-auto flex-shrink-0">
        <img
          src={imageList[selectedIndex]?.url}
          alt={`Product image ${selectedIndex + 1}`}
          className="h-full w-full object-cover rounded-lg"
         
        />
        
        {/* Navigation arrows - only show if there are multiple images */}
        {imageList.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto w-full justify-center">
          {imageList.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden ${
                selectedIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/400/320";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;