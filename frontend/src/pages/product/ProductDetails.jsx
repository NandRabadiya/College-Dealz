import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductGallery from './ProductGallery';
import { API_BASE_URL } from '../Api/api';
import { fetchProductWithImages } from './fetch';
// ProductDetails Component
const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await fetchProductWithImages(productId);
        setProduct(productData);
      } catch (err) {
        setError(err.message);
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);
  const handleChat = async () => {
    // Implement chat functionality
    console.log('Starting chat with seller');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing product');
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error || !product) {
    return <div className="container mx-auto p-4">Product not found</div>;
  }

  return (
    <div className="container mx-auto h-80% flex items-center justify-center p-4">
      <div className="grid gap-8 md:grid-cols-2 w-full max-w-5xl">
        {/* Image Gallery Section */}
        <div className="flex justify-center">
          <ProductGallery productId={product.id} />
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-2xl font-bold text-primary">₹{product.price}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {product.seller?.name || 'Unknown Seller'}
              </Badge>
              <span className="text-xs">•</span>
              <span className="text-sm text-muted-foreground">
                {new Date(product.postDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Condition</h3>
              <Badge variant="outline">{product.condition}</Badge>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Category</h3>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            {product.monthsOld && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Age</h3>
                <p className="text-muted-foreground">{product.monthsOld} months old</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {product.location && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground">{product.location}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <Button className="flex-1" onClick={handleChat}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with Seller
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
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