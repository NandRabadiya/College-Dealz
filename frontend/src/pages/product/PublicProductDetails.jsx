import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Share2,
  MessageCircle,
  Facebook,
  Mail,
  Link as LinkIcon,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_BASE_URL } from "../Api/api";

const PublicProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const placeholderImage = "/api/placeholder/400/320";

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      navigate(`/product/${productId}`);
      return;
    }

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/products/public/shared-product/${productId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        let productData = await response.json();

        // Transform the API response to match component's expected format
        const transformedProduct = {
          id: productData.product_id,
          name: productData.product_name,
          description: productData.product_description,
          price: productData.product_price,
          images:
            productData.image_urls?.length > 0
              ? productData.image_urls.map((url, index) => ({
                  id: `${productData.product_id}-${index}`,
                  url: url,
                  fileName: `image-${index}`,
                }))
              : [
                  {
                    id: "placeholder",
                    url: placeholderImage,
                    fileName: "placeholder",
                  },
                ],
        };

        setProduct(transformedProduct);
      } catch (err) {
        setError(err.message);
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, navigate]);
  const handleLoginClick = () => {
    // Store the product ID in session storage for redirect after login
    sessionStorage.setItem("redirectProductId", productId);
    navigate("/Authenticate");
  };

  const handleShare = (platform, e) => {
    e.preventDefault();

    const productUrl = window.location.href;
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
    }
  };

  const navigateImage = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-4 min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-red-500">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2 w-full max-w-5xl mx-auto">
        {/* Image Section */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <img
            src={product.images[currentImageIndex].url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.images.length > 1 && (
            <>
              {/* Navigation Arrows */}
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentImageIndex
                        ? 'bg-primary'
                        : 'bg-muted-foreground/50'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-2xl font-bold text-primary">
              ₹{product.price}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button className="flex-1" onClick={handleLoginClick}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Log In to Chat
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => handleShare('whatsapp', e)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare('facebook', e)}>
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare('email', e)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare('copy', e)}>
                  <LinkIcon className="mr-2 h-4 w-4" />
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

export default PublicProductDetails;