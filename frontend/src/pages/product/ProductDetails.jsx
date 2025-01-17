import React from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductGallery from './ProductGallery';
import productData from './productCard.json'; // ✅ Import product data

const ProductDetails = () => {
  const { id } = useParams();

  // ✅ Find product by ID
  const product = productData.find((item) => item.id === parseInt(id));

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto h-80% flex items-center justify-center">
      <div className="grid gap-8 md:grid-cols-2 w-full max-w-5xl">
        {/* Image Gallery Section */}
        <div className="flex justify-center">
          <ProductGallery images={[product.image]} />
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
