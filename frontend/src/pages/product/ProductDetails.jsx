import React from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductGallery from './ProductGallery';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = true;

  // Example product data and images
  const product = {
    name: "Test Product",
    price: "$99.99",
    seller_name: "Test Seller",
    post_date: "2024-01-03",
    description: "This is a test product description",
    images: [
      'iphone.jpg',
      'goggle.svg',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400'
    ]
  };

  return (
    <div className="container mx-auto h-80% flex items-center justify-center">
  <div className="grid gap-8 md:grid-cols-2 w-full max-w-5xl">
    {/* Image Gallery Section */}
    <div className="flex justify-center">
      <ProductGallery images={product.images} />
    </div>

    {/* Product Info Section */}
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <div className="text-2xl font-bold text-primary">{product.price}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {product.seller_name}
          </Badge>
          <span className="text-xs">•</span>
          <span className="text-sm text-muted-foreground">{product.post_date}</span>
        </div>
      </div>

      <div className="prose max-w-none">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-muted-foreground">{product.description}</p>
      </div>

      <div className="flex gap-4 pt-6">
        <Button className="flex-1">
          <MessageCircle className="mr-2 h-5 w-5" />
          Chat with Seller
        </Button>
        <Button variant="outline" className="flex-1">
          <Share2 className="mr-2 h-5 w-5" />
          Share
        </Button>
      </div>
    </div>
  </div>
</div>

  );
};

export default ProductDetails;
