// ProductCard.jsx
import React from "react";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import procard from "./productCard.json"
import { useNavigate } from "react-router-dom";


const ProductCard = () => {
  // Get authentication context
  const { isAuthenticated, setPendingAction } = false;
  const navigate = useNavigate();

  // Handler for protected actions
  const handleProtectedAction = (action, e) => {
    // Prevent event bubbling if event exists
    if (e) {
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      setPendingAction(() => action);
      navigate("/Authenticate");
    } else {
      action();
    }
  };

  // Action handlers
  const handleProductClick = (productId) => {
  // Store the productId for the pending action
  localStorage.setItem('pendingProductId', productId);
  // Open authentication modal
  setAuthModalOpen(true);
};


  const handleWishlist = (product, e) => {
    handleProtectedAction(() => {
      // Add to wishlist logic
      console.log("Adding to wishlist:", product);
    }, e);
  };

  const handleChat = (product, e) => {
    handleProtectedAction(() => {
      // Start chat logic
      console.log("Starting chat about:", product);
    }, e);
  };

  // Share doesn't require authentication
  const handleShare = (product, e) => {
    e.stopPropagation();
    console.log("Sharing product:", product);
  };

  return (
    <div className="m-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {procard.map((product, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg cursor-pointer"
            onClick={() => handleProductClick({ id: 1, name: "Sample Product" })}
          >
            {/* Image Container */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={`/${product.image}`}
                alt={product.name}
                className="h-auto w-50% object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={(e) => handleWishlist(product, e)}
              >
                <Heart className={`h-5 w-5 text-primary ${
                  isAuthenticated && product.isWishlisted ? 'fill-primary' : ''
                }`} />
              </Button>
            </div>

            {/* Content Container */}
            <div className="p-4">
              {/* Title and Price Row */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight text-foreground text-xl line-clamp-2">
                  {product.name}
                </h3>
                <div className="text-xl font-bold text-primary whitespace-nowrap">
                  {product.price}
                </div>
              </div>

              {/* Seller Info */}
              <div className="mb-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {product.seller_name}
                  </Badge>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{product.post_date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => handleChat(product, e)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => handleShare(product, e)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
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