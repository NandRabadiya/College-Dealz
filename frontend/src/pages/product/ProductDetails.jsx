import React, { useState, useEffect } from "react";
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

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerInfo, setSellerInfo] = useState({
    name: "Unknown Seller",
    createdAt: new Date(),
  });
  const currentUserId = localStorage.getItem("userId");

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
  }, [productId]);

  const handleChat = async () => {
    // Implement chat functionality using sellerId
    console.log("Starting chat with seller:", product.sellerId);
  };

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
        <div className="text-lg">Loading...</div>
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
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              {product.name}
            </h1>
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
              {String(currentUserId) !== String(product.sellerId) ? (
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
