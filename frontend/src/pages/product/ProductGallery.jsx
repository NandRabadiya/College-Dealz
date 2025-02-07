import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '../Api/api';
// ProductGallery Component
const ProductGallery = ({ productId }) => {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await fetch(`${API_BASE_URL}/api/images/product/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch images');
        const imageData = await response.json();
        setImages(imageData);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchImages();
    }
  }, [productId]);

  if (loading) {
    return <div>Loading images...</div>;
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p>No images available</p>
      </div>
    );
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
        {images.length > 0 ? (
          <img
            src={images[selectedIndex]?.url || `/api/placeholder/400/320`}
            alt={`Product image ${selectedIndex + 1}`}
            className="h-full w-full object-cover rounded-lg bg-gray-100"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
            <p>No image available</p>
          </div>
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
                src={image.url || `/api/placeholder/400/320`}
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