import React from "react";
import {
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../Api/api";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductCard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showUniversityDialog, setShowUniversityDialog] = useState(false);
  const [dialogInitialized, setDialogInitialized] = useState(false);
  const [open, setOpen] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(2);
  const [totalElements, setTotalElements] = useState(0);

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("jwt"))
  );
  const navigate = useNavigate();

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/universities`);
        if (!response.ok) throw new Error("Failed to fetch universities");
        const data = await response.json();
        setUniversities(data);
        setDialogInitialized(true);
      } catch (err) {
        console.error("Error fetching universities:", err);
        setError("Failed to fetch universities");
      }
    };
    fetchUniversities();
  }, []);

  // Show university selection dialog for non-logged-in users
  useEffect(() => {
    if (dialogInitialized && !isAuthenticated && !selectedUniversity) {
      console.log("Showing university dialog");
      setShowUniversityDialog(true);
    }
  }, [isAuthenticated, selectedUniversity, dialogInitialized]);

  // Modified product fetch function to handle both authenticated and non-authenticated cases
  const fetchProducts = async (universityId = null, page = 0) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Don't fetch if we need a university ID but don't have one
      if (!token && !universityId) {
        setProducts([]);
        return;
      }

      // Use different endpoints based on authentication status
      const endpoint = token
        ? `${API_BASE_URL}/api/products/university`
        : `${API_BASE_URL}/api/products/public/university/${universityId}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers, // Include additional headers if needed
        },
        body: JSON.stringify({
          page: page,
          size: pageSize,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const responseData = await response.json();
      // Extract products array from the content property
      const data = responseData.content || [];
      console.log("Fetched products:", data);
      // Update pagination state
      setTotalPages(responseData.totalPages);
      setTotalElements(responseData.totalElements);
      setCurrentPage(responseData.number);

      // Process products with images
      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          if (product.imageUrls?.length > 0) {
            return {
              ...product,
              images: product.imageUrls.map((url, index) => ({
                id: `${product.id}-${index}`,
                url: url,
                fileName: `image-${index}`,
              })),
            };
          }

          // Fetch images if needed
          if (token) {
            try {
              const imagesResponse = await fetch(
                `${API_BASE_URL}/api/images/product/${product.id}`,
                { headers }
              );
              if (imagesResponse.ok) {
                const images = await imagesResponse.json();
                return {
                  ...product,
                  images: images
                    .map((img) =>
                      img.s3_url
                        ? {
                            id: img.image_id,
                            url: img.s3_url,
                            fileName: img.file_name,
                          }
                        : null
                    )
                    .filter(Boolean),
                };
              }
            } catch (error) {
              console.error(
                `Error fetching images for product ${product.id}:`,
                error
              );
            }
          }
          return { ...product, images: [] };
        })
      );

      setProducts(productsWithImages);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle university selection
  const handleUniversitySelect = (universityId) => {
    setSelectedUniversity(universityId);
    setShowUniversityDialog(false);
    fetchProducts(universityId);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);
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
  const handleWishlist = async (productId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      setOpen(true); // Show login/university dialog
      return;
    }
    const token = localStorage.getItem("jwt");
    console.log("Adding to wishlist:", productId);

    try {
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
      // Handle page change

      if (!response.ok) {
        throw new Error("Failed to add to wishlist");
      }

      // Update local state to reflect wishlist change
      setWishlistedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });

      // Optionally update the products state to reflect the change
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? { ...product, isWishlisted: !product.isWishlisted }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
      // Add error handling UI feedback here
    }
  };
  // Add this effect to fetch initial wishlist status
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch wishlist");

        const wishlistItems = await response.json();
        setWishlistedItems(
          new Set(wishlistItems.map((item) => item.productId))
        );
      } catch (error) {
        console.error("Error fetching wishlist status:", error);
      }
    };

    fetchWishlistStatus();
  }, [isAuthenticated]);

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
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      const universityId = isAuthenticated ? null : selectedUniversity;
      fetchProducts(universityId, newPage);
    }
  };
  if (loading) {
    return <div className="m-4 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="m-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <>
      {/* <Dialog open={open} onOpenChange={setOpen} className="z-9999">
        {console.log("Dialog")}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Your University</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Select
              onValueChange={(value) => {
                handleUniversitySelect(value);
                setOpen(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.id}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog> */}
      <div className="m-4">
        {/* University selection for manual change */}
        {!isAuthenticated && selectedUniversity && (
          <div className="mb-4">
            <Select
              value={selectedUniversity}
              onValueChange={handleUniversitySelect}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.id}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
                  src={product.images?.[0]?.url || "/api/placeholder/400/320"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/400/320";
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-10"
                  onClick={(e) => handleWishlist(product.id, e)}
                >
                  <Heart
                    className={`h-6 w-6 transition-colors duration-200 ${
                      wishlistedItems.has(product.id)
                        ? "fill-primary text-primary"
                        : "text-primary hover:fill-primary/20"
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
                      {product.seller?.name || "Unknown Seller"}
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

        {/* Pagination UI */}
        <div className="mt-8 flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {products.length} of {totalElements} items
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="w-24"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="w-24"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
