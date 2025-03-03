import React from "react";
import {
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Mail,
  Link,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import debounce from "lodash/debounce";
import FilterComponent from "./Filter";

const ProductCard = ({
  searchQuery,
  sortField,
  sortDir,
  selectedUniversity,
}) => {
  console.log("ProductCard mounted with university:", selectedUniversity);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState();
  const [totalElements, setTotalElements] = useState(0);
  const [open, setOpen] = useState(false);
  const placeholderImage = "/api/placeholder/400/320";
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSort, setCurrentSort] = useState(
    `${sortField || "postDate"}-${sortDir || "desc"}`
  );
  const [currentSearch, setCurrentSearch] = useState(searchQuery || "");
  const [currentFilters, setCurrentFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    categories: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("jwt"))
  );

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    categories: "",
  });

  // Modified fetchProducts function in ProductCard.jsx
  const fetchProducts = async (
    page = currentPage,
    query = searchQuery,
    field = sortField,
    direction = sortDir,
    filterValues = filters
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let endpoint;
      let method = "POST";
      let body;

      if (token) {
        if (query) {
          // Use search endpoint for authenticated users when there's a search query
          endpoint = `${API_BASE_URL}/api/products/search/${query}`;
          method = "GET";
          body = null;
        } else {
          // Use regular endpoint for normal listing
          endpoint = `${API_BASE_URL}/api/products/university`;
          body = {
            page: page,
            size: pageSize,
            sortField: field || "postDate",
            sortDir: direction || "desc",
            category: filterValues.categories,
            minPrice: filterValues.minPrice,
            maxPrice: filterValues.maxPrice,
          };
        }
      } else {
        // For non-authenticated users, always use the public endpoint
        endpoint = `${API_BASE_URL}/api/products/public/university/${selectedUniversity}`;
        body = {
          page: page,
          size: pageSize,
          sortField: field || "postDate",
          sortDir: direction || "desc",
          category: filterValues.categories,
          minPrice: filterValues.minPrice,
          maxPrice: filterValues.maxPrice,
        };
      }

      console.log("Fetching from endpoint:", endpoint);
      console.log("Request body:", body);

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          ...(method === "POST" && { "Content-Type": "application/json" }),
          ...headers,
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const responseData = await response.json();
      console.log("Received response:", responseData);

      // Handle both paginated and non-paginated responses
      const content = responseData.content || responseData;
      const productsWithImages = (
        Array.isArray(content) ? content : [content]
      ).map((product) => ({
        ...product,
        images:
          product.imageUrls?.length > 0
            ? product.imageUrls.map((url, index) => ({
                id: `${product.id}-${index}`,
                url: url,
                fileName: `image-${index}`,
              }))
            : [
                {
                  id: product.id,
                  url: placeholderImage,
                  fileName: "placeholder",
                },
              ],
      }));

      setProducts(productsWithImages);
      if (responseData.totalPages) {
        setTotalPages(responseData.totalPages);
        setTotalElements(responseData.totalElements);
        setCurrentPage(responseData.number);
      } else {
        // If it's a search response without pagination
        setTotalPages(1);
        setTotalElements(productsWithImages.length);
        setCurrentPage(0);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Main effect for fetching products
  useEffect(() => {
    if (selectedUniversity || isAuthenticated) {
      console.log("Triggering product fetch. University:", selectedUniversity);
      fetchProducts();
    }
  }, [
    searchQuery,
    sortField,
    sortDir,
    currentPage,
    selectedUniversity,
    isAuthenticated,
    filters,
  ]);

  const handleFilterChange = (newFilters) => {
    setCurrentFilters(newFilters);
    setCurrentPage(0);
    fetchProducts(0, currentSearch, sortField, sortDir, newFilters);
  };
  const handleSort = (value) => {
    const [field, dir] = value.split("-");
    setCurrentSort(value);
    fetchProducts(currentPage, currentSearch, field, dir, currentFilters);
  };

  const handleSearch = (query) => {
    setCurrentSearch(query);
    setCurrentPage(0);
    fetchProducts(0, query, sortField, sortDir, currentFilters);
  };

  const handleProtectedAction = (action, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      console.log("User not authenticated");
      setOpen(true);
    } else {
      action();
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleWishlist = async (productId, e) => {
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

      setWishlistedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? { ...product, isWishlisted: !product.isWishlisted }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

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
        const wishlistSet = new Set(
          wishlistItems.map((item) => item.productId)
        );
        setWishlistedItems(wishlistSet);

        setProducts((prevProducts) =>
          prevProducts.map((product) => ({
            ...product,
            isWishlisted: wishlistSet.has(product.id),
          }))
        );
      } catch (error) {
        console.error("Error fetching wishlist status:", error);
      }
    };

    fetchWishlistStatus();
  }, [isAuthenticated]);

  const handleChat = (product, e) => {
    handleProtectedAction(() => {
      console.log("Starting chat about:", product);
    }, e);
  };

  const handleShare = (product, platform, e) => {
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
          // You might want to show a toast notification here
          alert("Link copied to clipboard!");
        });
        break;
      default:
        break;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="m-4 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="m-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <FilterComponent
          onFilterChange={handleFilterChange}
          currentFilters={currentFilters}
          className="lg:sticky lg:top-4"
        />

        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-foreground hover:bg-muted"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share2 className="mr-2 h-4 w-4 text-inherit" />
                              Share
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleShare(product, "whatsapp", e)
                              }
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleShare(product, "facebook", e)
                              }
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
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  Showing {products.length} of {totalElements} items
                </div>

                <div className="flex items-center space-x-2 order-1 sm:order-2">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
