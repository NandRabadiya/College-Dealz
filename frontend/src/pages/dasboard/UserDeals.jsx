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

  const getAuthToken = () => {
    return localStorage.getItem("jwt"); // or however you store your JWT token
  };
  useEffect(() => {
    fetchUserDeals();
  }, []);

  const fetchUserDeals = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/products/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      } else if (response.status === 401) {
        // Handle unauthorized access
        console.log("Unauthorized access. Please login again.");
        // Implement your logout/redirect logic here
      }
    } catch (error) {
      console.log("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteDeal = async (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/products/${dealId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setDeals(deals.filter((deal) => deal._id !== dealId));
        }
      } catch (error) {
        console.error("Error deleting deal:", error);
      }
    }
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setIsAddingDeal(true);
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
          {deals.map((deal) => (
            <Card key={deal._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="relative">
                {/* <img
                  src={deal.images[0]}
                  alt={deal.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                /> */}
                <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
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

      {isAddingDeal && (
        <PostADeal
          onClose={() => {
            setIsAddingDeal(false);
            setEditingDeal(null);
            fetchUserDeals();
          }}
          editDeal={editingDeal}
        />
      )}
    </div>
  );
};

export default UserDeals;
