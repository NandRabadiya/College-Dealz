import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Share2,
  MessageCircle,
  Facebook,
  Mail,
  Link,
  MessageSquare,
  Clock,
  User,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductGallery from "./ProductGallery";
import { API_BASE_URL } from "../Api/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatInitiator from "../chat/ChatInitiator";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerInfo, setSellerInfo] = useState({
    name: "Unknown Seller",
    createdAt: new Date(),
  });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const currentUserId = localStorage.getItem("userId");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("jwt"))
  );
  const [open, setOpen] = useState(false);

  // Function to check if product is in wishlist
  const checkWishlistStatus = useCallback(async (productId) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return false;

      const response = await fetch(
        `${API_BASE_URL}/api/wishlist/${productId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const isInWishlist = await response.json();
        return isInWishlist;
      }
      return false;
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProductData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const productData = await response.json();

        if (!isMounted) return;

        // Transform the product data according to the new JSON structure
        if (productData && productData.id) {
          const transformedProduct = {
            id: productData.id,
            name: productData.name || "Unnamed Product",
            description: productData.description || "No description available",
            price: productData.price || 0,
            condition: productData.condition || "Not specified",
            category: productData.category || "Uncategorized",
            monthsOld: productData.monthsOld,
            sellerId: productData.sellerId,
            universityId: productData.universityId,
            // Handle empty image arrays or null images
            images:
              productData.imageUrls && productData.imageUrls.length > 0
                ? productData.imageUrls.map((url, index) => ({
                    id: `${productData.id}-${index}`,
                    url: url,
                    fileName: `image-${index}`,
                  }))
                : [
                    {
                      id: "placeholder",
                      url: "/api/placeholder/400/320",
                      fileName: "placeholder",
                    },
                  ],
            createdAt: productData.createdAt || new Date().toISOString(),
          };

          setProduct(transformedProduct);

          // Check if product is wishlisted
          const wishlistStatus = productData.wishlisted || await checkWishlistStatus(productData.id);
          setIsWishlisted(wishlistStatus);

          // Fetch seller info if available
          if (productData.sellerId) {
            fetchSellerInfo(productData.sellerId, token);
          }
        } else {
          throw new Error("Invalid product data received");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error("Error loading product details:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchSellerInfo = async (sellerId, token) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${sellerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (isMounted) {
            setSellerInfo({
              name: userData.name || userData.username || "Unknown Seller",
              createdAt: product?.createdAt || new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Error fetching seller info:", err);
      }
    };

    if (productId) {
      fetchProductData();
    }

    return () => {
      isMounted = false;
    };
  }, [productId, checkWishlistStatus]);
  
  const handleWishlist = useCallback(async (productId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      setOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      
      // If already wishlisted, remove from wishlist
      if (isWishlisted) {
        const response = await fetch(
          `${API_BASE_URL}/api/wishlist/${productId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist");
        }
        
        setIsWishlisted(false);
      } 
      // Otherwise, add to wishlist
      else {
        const response = await fetch(
          `${API_BASE_URL}/api/wishlist/${productId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add to wishlist");
        }
        
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  }, [isAuthenticated, isWishlisted]);



  const handleShare = (product, platform, e) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/product/public/${product.id}`;
    const message = `Check out this product: ${product.name}`;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            message + " " + productUrl
          )}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            productUrl
          )}`,
          "_blank"
        );
        break;
      case "email":
        window.open(
          `mailto:?subject=${encodeURIComponent(
            product.name
          )}&body=${encodeURIComponent(message + "\n\n" + productUrl)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(productUrl).then(() => {
          alert("Link copied to clipboard!");
        });
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-4 flex items-center justify-center min-h-[300px]">
        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 w-full max-w-5xl">
          {/* Left side - Image gallery skeleton */}
          <div className="flex justify-center px-2 md:px-0">
            <Skeleton className="w-full aspect-square rounded-lg" />
          </div>
          
          {/* Right side - Product information skeleton */}
          <div className="space-y-4 sm:space-y-6 px-2 md:px-0">
            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-7 w-1/3 mb-4" />
              <div className="mt-3">
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="border-t border-b py-3 my-3 grid grid-cols-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/2 ml-auto" />
            </div>
            
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="container mx-auto px-3 py-4 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Format the condition and category for display
  const formatString = (str) => {
    return str
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  return (
    <div className="container mx-auto min-h-[70vh] flex items-start justify-center px-3 py-3 sm:px-4 sm:py-4">
      <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 w-full max-w-5xl">
        <div className="flex justify-center px-2 md:px-0">
          <ProductGallery images={product.images} />
        </div>

        <div className="space-y-4 sm:space-y-6 px-2 md:px-0">
          {/* SECTION 1: Name, price, description */}
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
              <Button
                variant="ghost"
                onClick={(e) => handleWishlist(product.id, e)}
                className="ml-2 p-0 hover:bg-muted rounded-full h-12 w-12 flex items-center justify-center"
              >
                <Heart
                  className={`transition-colors duration-200 ${
                    isWishlisted
                      ? "fill-primary text-primary"
                      : "text-primary hover:fill-primary/20"
                  }`}
                  size={32}
                />
              </Button>
            </div>

            <div
              className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-4 ${
                product.price === 0 ? "text-green-600" : "text-primary"
              }`}
            >
              {product.price === 0 ? "Free" : `₹${product.price.toFixed(2)}`}
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-semibold mb-1">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          {/* SECTION 2: Condition, category, age */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Condition</h3>
              <Badge variant="outline">{formatString(product.condition)}</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-1">Category</h3>
              <Badge variant="outline">{formatString(product.category)}</Badge>
            </div>

            {product.monthsOld != null && (
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  Product is used for
                </h3>
                <p className="text-sm text-muted-foreground">
                  {product.monthsOld} year(s)
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: Seller name and date */}
          <div className="border-t border-b py-3 my-3 grid grid-cols-2">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{sellerInfo.name}</span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(product.createdAt)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <div className="flex-1">
              {String(currentUserId) != String(product.sellerId) ? (
                <ChatInitiator
                  productId={product.id}
                  sellerId={product.sellerId}
                  currentUserId={currentUserId}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="w-full h-7 px-1 py-0 text-xs text-muted-foreground hover:bg-muted cursor-default"
                >
                  <MessageCircle className="mr-1 h-3 w-3 text-inherit" />
                  Your Product
                </Button>
              )}
            </div>
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 px-1 py-0 text-xs text-foreground hover:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="mr-1 h-3 w-3 text-inherit" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => handleShare(product, "whatsapp", e)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => handleShare(product, "facebook", e)}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => handleShare(product, "email", e)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => handleShare(product, "copy", e)}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;