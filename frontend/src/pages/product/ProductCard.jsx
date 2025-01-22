import React from "react";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../Api/api";
import { useEffect, useState } from "react";


const ProductCard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("jwt")));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversityProducts = async () => {
      try {
        const token = localStorage.getItem('jwt'); // Assuming you store JWT in localStorage
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/products/university`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityProducts();
  }, []);
  // Function to handle protected actions like Wishlist and Chat
  const handleProtectedAction = (action, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      console.log("User not authenticated");
    } else {
      action();
    }
  };

  // Navigate to product details page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Add product to Wishlist
  const handleWishlist = (product, e) => {
    handleProtectedAction(() => {
      console.log("Adding to wishlist:", product);
    }, e);
  };

  // Start chat with seller
  const handleChat = (product, e) => {
    handleProtectedAction(() => {
      console.log("Starting chat about:", product);
    }, e);
  };

  // Share product
  const handleShare = (product, e) => {
    e.stopPropagation();
    console.log("Sharing product:", product);
  };
  if (loading) {
    return <div className="m-4 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="m-4 text-center text-red-500">Error: {error}</div>;
  }


  return (
    <div className="m-4">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md cursor-pointer"
            onClick={() => handleProductClick(product.id)}
          >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={product.images?.[0]?.url || '/api/placeholder/400/320'}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={(e) => handleWishlist(product, e)}
              >
                <Heart
                  className={`h-6 w-6 text-primary transition ${
                    product.isWishlisted ? "fill-primary" : "hover:fill-primary"
                  }`}
                />
              </Button>
            </div>

            {/* Product Info Section */}
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight text-foreground text-xl line-clamp-2">
                  {product.name}
                </h3>
                <div className="text-xl font-bold text-primary whitespace-nowrap">
                  ₹{product.price}
                </div>
              </div>

              <div className="mb-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {product.seller?.name || 'Unknown Seller'}
                  </Badge>
                  <span className="text-xs">•</span>
                  <span className="text-xs">
                    {new Date(product.postDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-foreground hover:bg-muted"
                  onClick={(e) => handleChat(product, e)}
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-inherit" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-foreground hover:bg-muted"
                  onClick={(e) => handleShare(product, e)}
                >
                  <Share2 className="mr-2 h-4 w-4 text-inherit" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;