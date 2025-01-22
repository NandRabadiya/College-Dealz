import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PostADeal from ".././product/PostADeal";
import { API_BASE_URL } from "../../pages/Api/api";
import { Image as ImageIcon } from "lucide-react";

const UserDeals = () => {
  const [deals, setDeals] = useState([]);
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDeals();
  }, []);

  const fetchUserDeals = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setError("No authentication token found. Please login.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/products/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // For each product, fetch its images
        const dealsWithImages = await Promise.all(
          data.map(async (deal) => {
            console.log("Processing deal:", deal);
            const dealId = deal.id || deal.product_id;
            if (!dealId) {
              console.warn("Deal missing ID:", deal);
              return { ...deal, images: [] };
            }
            
          // If the deal already has imageUrls, use those
          if (deal.imageUrls && deal.imageUrls.length > 0) {
            return {
              ...deal,
              id: dealId,
              images: deal.imageUrls.map((url, index) => ({
                id: `${dealId}-${index}`,
                url: url,
                fileName: `image-${index}`
              }))
            };
          }

          // Otherwise, try to fetch images from the API
          try {
            const imagesResponse = await fetch(
              `${API_BASE_URL}/api/images/product/${dealId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (imagesResponse.ok) {
              const images = await imagesResponse.json();
              return {
                ...deal,
                id: dealId, // Ensure consistent id field
                images: images
                .map((img) => {
                  // Check if we have an S3 URL first
                  if (img.s3_url) {
                    return {
                      id: img.image_id,
                      url: img.s3_url,
                      fileName: img.file_name
                    };
                  }
                  return null;
                })
                .filter(Boolean) // Remove any null entries
            };
          }
          console.warn(`Failed to fetch images for deal ${dealId}`);
          return { ...deal, images: [] };
        } catch (error) {
          console.error(`Error fetching images for deal ${dealId}:`, error);
          return { ...deal, images: [] };
        }
      })
    );
        setDeals(dealsWithImages);
        setError(null);
      } else if (response.status === 401) {
        setError("Unauthorized access. Please login again.");
      } else {
        setError("Failed to fetch deals");
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      setError("Error loading deals");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${API_BASE_URL}/api/products/${dealId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // Immediately update local state
          setDeals(deals.filter((deal) => deal.id !== dealId));
          // Then refresh from server to ensure synchronization
          await fetchUserDeals();
        } else {
          const errorData = await response.json();
          console.error("Delete failed:", errorData);
        }
      } catch (error) {
        console.error("Error deleting deal:", error);
      }
    }
  };

  const renderDealImage = (deal) => {
    if (deal.images && deal.images.length > 0) {
      return (
        <img
          src={deal.images[0].url}
          alt={deal.name}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.target.onerror = null;
            // You can replace this with an actual placeholder image path
            e.target.src = "account.png";
          }}
        />
      );
    }
    return (
      <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  };
  const handleEditDeal = (deal) => {
    const editDeal = {
      ...deal,
      id: deal.id, // Ensure we're using product_id for editing
    };
    setEditingDeal(editDeal);
    setIsAddingDeal(true);
  };
  const handleDealUpdate = async (success = false) => {
    if (success) {
      await fetchUserDeals();
    }
    setIsAddingDeal(false);
    setEditingDeal(null);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Deals</h2>
        <Button
          onClick={() => setIsAddingDeal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Post New Deal
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : deals.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">
              You haven't posted any deals yet.
            </p>
            <Button
              variant="link"
              onClick={() => setIsAddingDeal(true)}
              className="mt-2"
            >
              Post your first deal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <Card
              key={deal.id || `deal-${index}`}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="relative">
                {renderDealImage(deal)}
                <Badge
                  className="absolute top-2 right-2"
                  variant={deal.condition === "new" ? "default" : "secondary"}
                >
                  {deal.condition}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle>{deal.name}</CardTitle>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(deal.price)}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {deal.description}
                </p>
                <Badge variant="outline">{deal.category}</Badge>
              </CardContent>
              <CardFooter className="justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleEditDeal(deal)}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-destructive"
                  onClick={() => handleDeleteDeal(deal.id)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {error && <div className="text-red-500 text-center py-2">{error}</div>}

      {isAddingDeal && (
        <PostADeal onClose={handleDealUpdate} editDeal={editingDeal} />
      )}
    </div>
  );
};

export default UserDeals;
