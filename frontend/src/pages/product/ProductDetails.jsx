// export default ProductDetails;
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Share2,
  MessageCircle,
  Facebook,
  Mail,
  Link,
  MessageSquare,
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

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          };

          setProduct(transformedProduct);
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
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
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

  return (
    <div className="container mx-auto min-h-[80vh] flex items-start justify-center p-4">
      <div className="grid gap-8 md:grid-cols-2 w-full max-w-5xl">
        <div className="flex justify-center">
          <ProductGallery images={product.images} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div
              className={`text-2xl font-bold ${
                product.price === 0 ? "text-green-600" : "text-primary"
              }`}
            >
              {product.price === 0 ? "Free" : `₹${product.price.toFixed(2)}`}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Condition</h3>
              <Badge variant="outline">{formatString(product.condition)}</Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Category</h3>
              <Badge variant="outline">{formatString(product.category)}</Badge>
            </div>

            {product.monthsOld != null && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Age</h3>
                <p className="text-muted-foreground">
                  {product.monthsOld} months old
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button className="flex-1" onClick={handleChat}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with Seller
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-foreground hover:bg-muted"
                >
                  <Share2 className="mr-2 h-4 w-4 text-inherit" />
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
  );
};

export default ProductDetails;
