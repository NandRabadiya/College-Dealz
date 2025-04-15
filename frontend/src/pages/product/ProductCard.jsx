import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Loader2,
  SlidersHorizontal,
  ArrowDownAZ,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../Api/api";
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
import { useSelector } from "react-redux";
import axios from "axios";
import ChatInitiator from "../chat/ChatInitiator";

const ProductCard = ({
  searchQuery,
  sortField: initialSortField,
  sortDir: initialSortDir,
  selectedUniversity,
}) => {
  console.log("ProductCard mounted with university:", selectedUniversity);
  const currentUserId = localStorage.getItem("userId");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(12); // Set default page size
  const [totalElements, setTotalElements] = useState(0);
  const [open, setOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const placeholderImage = "/api/placeholder/400/320";
  const navigate = useNavigate();
  const location = useLocation();

  // Updated sort state management
  const [sortField, setSortField] = useState(initialSortField || "postDate");
  const [sortDir, setSortDir] = useState(initialSortDir || "desc");
  const [currentSort, setCurrentSort] = useState(`${sortField}-${sortDir}`);
  const [currentSearch, setCurrentSearch] = useState(searchQuery || "");

  // Default filter values
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    categories: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("jwt"))
  );

  // Memoize filter state
  const filterState = useMemo(() => ({
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    categories: filters.categories,
  }), [filters.minPrice, filters.maxPrice, filters.categories]);

  // Memoize fetch products function for better performance
  const fetchProducts = useCallback(
    async (
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
    },
    [
      currentPage,
      sortField,
      sortDir,
      filters,
      pageSize,
      searchQuery,
      selectedUniversity,
    ]
  );

  // Main effect for fetching products
  useEffect(() => {
    if (selectedUniversity || isAuthenticated) {
      console.log("Triggering product fetch. University:", selectedUniversity);
      fetchProducts();
    }
  }, [fetchProducts, selectedUniversity, isAuthenticated]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setCurrentPage(0);
      fetchProducts(0, currentSearch, sortField, sortDir, newFilters);
    },
    [currentSearch, sortField, sortDir, fetchProducts]
  );

  // Handle sort changes
  const handleSort = useCallback(
    (value) => {
      const [field, dir] = value.split("-");
      setSortField(field);
      setSortDir(dir);
      setCurrentSort(value);
      fetchProducts(currentPage, currentSearch, field, dir, filters);
    },
    [currentPage, currentSearch, filters, fetchProducts]
  );

  const handleSearch = useCallback(
    (query) => {
      setCurrentSearch(query);
      setCurrentPage(0);
      fetchProducts(0, query, sortField, sortDir, filters);
    },
    [sortField, sortDir, filters, fetchProducts]
  );

  const handleProtectedAction = useCallback(
    (action, e) => {
      if (e) e.stopPropagation();
      if (!isAuthenticated) {
        console.log("User not authenticated");
        setOpen(true);
      } else {
        action();
      }
    },
    [isAuthenticated]
  );

  const handleProductClick = useCallback(
    (productId) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const handleShare = useCallback((product, platform, e) => {
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
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const formatDate = useCallback((dateString) => {
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
  }, []);

  // Memoize sort options
  const sortOptions = useMemo(
    () => [
      { value: "postDate-desc", label: "Newest First" },
      { value: "postDate-asc", label: "Oldest First" },
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
      { value: "name-asc", label: "Name: A-Z" },
      { value: "name-desc", label: "Name: Z-A" },
    ],
    []
  );

  // Memoize the product cards
  const renderedProducts = useMemo(() => {
    return products.map((product) => (
      <div
        key={product.id}
        className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md cursor-pointer"
        onClick={() => handleProductClick(product.id)}
      >
        {/* Mobile view: horizontal card layout */}
        <div className="block sm:hidden">
          <div className="flex flex-row">
            {/* Left side: Image */}
            <div className="relative w-32 h-32">
              <img
                src={product.images?.[0]?.url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Right side: Content */}
            <div className="flex-1 p-3">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold leading-tight text-foreground text-base line-clamp-2">
                      {product.name}
                    </h3>
                    <div
                      className={`text-base font-bold whitespace-nowrap ${
                        product.price === 0
                          ? "text-green-500"
                          : "text-primary"
                      }`}
                    >
                      {product.price === 0
                        ? "Free"
                        : `₹${product.price}`}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="font-normal text-xs"
                      >
                        {product.sellerName || "Unknown Seller"}
                      </Badge>
                      <span className="text-xs">•</span>
                      <span className="text-xs">
                        {formatDate(product.postDate)}
                      </span>
                      <span className="text-xs">•</span>
                      <Badge
                        variant="secondary"
                        className="font-normal text-xs"
                      >
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 border-t">
                  <div className="flex-1">
                    {String(currentUserId) !==
                    String(product.sellerId) ? (
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
                      <DropdownMenuContent
                        align="end"
                        className="w-48"
                      >
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
                          onClick={(e) =>
                            handleShare(product, "email", e)
                          }
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) =>
                            handleShare(product, "copy", e)
                          }
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
        </div>

        {/* Tablet and Desktop view: original card layout */}
        <div className="hidden sm:block">
          <div className="relative h-64 overflow-hidden">
            <img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight text-foreground text-xl line-clamp-2">
                {product.name}
              </h3>
              <div
                className={`text-xl font-bold whitespace-nowrap ${
                  product.price === 0
                    ? "text-green-500"
                    : "text-primary"
                }`}
              >
                {product.price === 0
                  ? "Free"
                  : `₹${product.price}`}
              </div>
            </div>

            <div className="mb-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="font-normal"
                >
                  {product.sellerName || "Unknown Seller"}
                </Badge>
                <span className="text-xs">•</span>
                <span className="text-xs">
                  {formatDate(product.postDate)}
                </span>
                <span className="text-xs">•</span>
                <Badge
                  variant="secondary"
                  className="font-normal text-xs"
                >
                  {product.category}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <div className="flex-1">
                {String(currentUserId) !==
                String(product.sellerId) ? (
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
                  <DropdownMenuContent
                    align="end"
                    className="w-48"
                  >
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
                      onClick={(e) =>
                        handleShare(product, "email", e)
                      }
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) =>
                        handleShare(product, "copy", e)
                      }
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
    ));
  }, [products, currentUserId, formatDate, handleProductClick, handleShare]);

  // Memoize the pagination controls
  const paginationControls = useMemo(() => {
    return (
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
    );
  }, [products.length, totalElements, currentPage, totalPages, handlePageChange]);

  // Skeleton loading UI
  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex lg:hidden gap-2 mb-4">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-9 w-1/2" />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-64">
            <Skeleton className="h-[500px] w-full" />
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="rounded-lg border">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
        {/* Mobile filter and sort buttons */}
        <div className="flex lg:hidden gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-center"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {filters.categories ||
            filters.minPrice > 0 ||
            filters.maxPrice < 5000 ? (
              <Badge variant="secondary" className="ml-2">
                {(filters.categories ? 1 : 0) +
                  (filters.minPrice > 0 || filters.maxPrice < 5000 ? 1 : 0)}
              </Badge>
            ) : null}
          </Button>

          <Select value={currentSort} onValueChange={handleSort}>
            <SelectTrigger className="flex-1 h-9">
              <div className="flex items-center">
                <ArrowDownAZ className="h-4 w-4 mr-2" />
                <span className="truncate">Sort</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* FilterComponent passing isMobileFilterOpen state */}
          <FilterComponent
            onFilterChange={handleFilterChange}
            currentFilters={filterState}
            isFilterOpen={isMobileFilterOpen}
            setIsFilterOpen={setIsMobileFilterOpen}
            sortOptions={sortOptions}
            currentSort={currentSort}
            onSortChange={handleSort}
            className="lg:sticky lg:top-4"
          />

          <div className="flex-1">
            {loading && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 opacity-60">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="rounded-lg border">
                    <Skeleton className="h-64 w-full" />
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    handleFilterChange({
                      minPrice: 0,
                      maxPrice: 5000,
                      categories: "",
                    });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {renderedProducts}
                </div>

                {paginationControls}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;