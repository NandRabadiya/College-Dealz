import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductGallery = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return <p>No images available for this product.</p>;
  }

  const handlePrevious = () => {
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const handleNext = () => {
    setSelectedIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full max-w-xs md:max-w-sm lg:max-w-md h-auto flex-shrink-0">
        <img
          src={images[selectedIndex]}
          alt={`Product image ${selectedIndex + 1}`}
          className="h-full w-full object-cover rounded-lg bg-gray-100"
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-md ${
                selectedIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              <img
                src={image}
                alt={`Product thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
