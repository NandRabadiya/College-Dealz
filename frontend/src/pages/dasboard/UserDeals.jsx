import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Share2,
  X,
  MessageSquare,
  Facebook,
  Mail,
  Link,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PostADeal from ".././product/PostADeal";
import { API_BASE_URL } from "../../pages/Api/api";
import { set } from "lodash";

const UserDeals = () => {
  const [deals, setDeals] = useState([]);
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [soldType, setSoldType] = useState(null);
  const [soldFormData, setSoldFormData] = useState({
    buyerEmail: "",
    soldPrice: "",
    soldDate: "",
    soldToUniversityStudent: "no",
    sellingReason: "",
  });
  const [interestedBuyers, setInterestedBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [repostDialogOpen, setRepostDialogOpen] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [understoodRepost, setUnderstoodRepost] = useState(false);
  const [currentDealId, setCurrentDealId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [confirmSoldDialogOpen, setConfirmSoldDialogOpen] = useState(false);
  const [tempSoldType, setTempSoldType] = useState(null);

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
        const dealsWithImages = await Promise.all(
          data.map(async (deal) => {
            const dealId = deal.id || deal.product_id;
            if (!dealId) {
              console.warn("Deal missing ID:", deal);
              return { ...deal, images: [] };
            }

            if (deal.imageUrls && deal.imageUrls.length > 0) {
              return {
                ...deal,
                id: dealId,
                images: deal.imageUrls.map((url, index) => ({
                  id: `${dealId}-${index}`,
                  url: url,
                  fileName: `image-${index}`,
                })),
              };
            }

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
                  id: dealId,
                  images: images
                    .map((img) => {
                      if (img.s3_url) {
                        return {
                          id: img.image_id,
                          url: img.s3_url,
                          fileName: img.file_name,
                        };
                      }
                      return null;
                    })
                    .filter(Boolean),
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

  const fetchInterestedBuyers = async (dealId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/api/products/${dealId}/interested-buyers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const buyers = await response.json();
        setInterestedBuyers(buyers);
      }
    } catch (error) {
      console.error("Error fetching interested buyers:", error);
    }
  };

  const handleRepost = async () => {
    if (!understoodRepost || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/api/products/${currentDealId}/relist`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFeedback({
          type: "success",
          message:
            "Deal reposted successfully! The page will refresh in a moment.",
        });
        setTimeout(async () => {
          await fetchUserDeals();
          setRepostDialogOpen(false);
          setUnderstoodRepost(false);
          setFeedback({ type: "", message: "" });
        }, 2000);
      } else {
        throw new Error("Failed to repost deal");
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Failed to repost deal. Please try again.",
      });
      setTimeout(() => {
        setFeedback({ type: "", message: "" });
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!removalReason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/api/products/remove-by-user/${currentDealId}?reason=${encodeURIComponent(
          removalReason
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFeedback({
          type: "success",
          message:
            "Deal removed successfully! The page will refresh in a moment.",
        });
        setTimeout(() => {
          setDeals(deals.filter((deal) => deal.id !== currentDealId));
          setRemoveDialogOpen(false);
          setRemovalReason("");
          setFeedback({ type: "", message: "" });
        }, 2000);
      } else {
        throw new Error("Failed to remove deal");
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Failed to remove deal. Please try again.",
      });
      setTimeout(() => {
        setFeedback({ type: "", message: "" });
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FeedbackAlert = ({ type, message }) => {
    if (!message) return null;

    return (
      <Alert
        className={`mb-4 ${
          type === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  };

  const handleShare = (deal, platform, e) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/product/public/${deal.id}`;
    const message = `Check out this product: ${deal.name}`;

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
            deal.name
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

  const handleEditDeal = (deal, e) => {
    e.preventDefault();
    e.stopPropagation();
    const editDeal = {
      ...deal,
      id: deal.id,
    };
    setEditingDeal(editDeal);
    setIsAddingDeal(true);
  };

  const handleSoldButtonClick = (deal, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDeal(deal);
  };

  const handleSoldTypeSelect = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    setTempSoldType(type);
    setConfirmSoldDialogOpen(true);
  };
  const handleConfirmShareDetails = (confirmed) => {
    if (confirmed) {
      // User wants to share details
      setConfirmSoldDialogOpen(false);
      setSoldType(tempSoldType);
      setSoldDialogOpen(true);
    } else {
      // User doesn't want to share details - implement quick mark as sold
      handleQuickMarkAsSold();
    }
  };

  const handleQuickMarkAsSold = async () => {
    if (!selectedDeal || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const token = localStorage.getItem("jwt");
      const endpoint =
        tempSoldType === "platform"
          ? `${API_BASE_URL}/api/products/sold-platform/${selectedDeal.id}`
          : `${API_BASE_URL}/api/products/sold-outside/${selectedDeal.id}`;

      const defaultData =
        tempSoldType === "platform"
          ? {
              productId: selectedDeal.id,
              soldPrice: selectedDeal.price,
              soldDate: new Date().toISOString(),
              buyerEmail: "Not specified",
            }
          : {
              productId: selectedDeal.id,
              soldToUniversityStudent: false,
              soldPrice: selectedDeal.price,
              soldDate: new Date().toISOString(),
              sellingReason: "Not specified",
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(defaultData),
      });

      if (response.ok) {
        // Show success message briefly
        setFeedback({
          type: "success",
          message: "Deal marked as sold successfully!",
        });

        // Reset and refresh data
        setTimeout(async () => {
          await fetchUserDeals();
          setSoldDialogOpen(false);
          setConfirmSoldDialogOpen(false);
          setTempSoldType(null);
          setSelectedDeal(null);
          setFeedback({ type: "", message: "" });
        }, 2000);
      } else {
        throw new Error("Failed to mark deal as sold");
      }
    } catch (error) {
      console.error("Error marking deal as sold:", error);
      setFeedback({
        type: "error",
        message: "Failed to mark deal as sold. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const renderDealImage = (deal) => {
    if (deal.images && deal.images.length > 0) {
      const currentImageIndex = currentImageIndexes[deal.id] || 0;
      return (
        <div className="relative">
          <img
            src={deal.images[currentImageIndex].url}
            alt={deal.name}
            className="w-full h-48 object-contain bg-gray-100 rounded-t-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "account.png";
            }}
          />
          {deal.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndexes((prev) => ({
                    ...prev,
                    [deal.id]:
                      ((prev[deal.id] || 0) - 1 + deal.images.length) %
                      deal.images.length,
                  }));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors duration-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndexes((prev) => ({
                    ...prev,
                    [deal.id]: ((prev[deal.id] || 0) + 1) % deal.images.length,
                  }));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors duration-200"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {deal.images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                      currentImageIndex === index ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      );
    }
    return (
      <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  };

  const handleSoldFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const formData = {
      productId: selectedDeal.id,
      ...(soldType === "platform"
        ? {
            buyerId: selectedBuyer,
            soldPrice: soldFormData.soldPrice,
            soldDate: soldFormData.soldDate,
            buyerEmail: soldFormData.buyerEmail,
          }
        : {
            soldToUniversityStudent:
              soldFormData.soldToUniversityStudent === "yes",
            sellingReason: soldFormData.sellingReason,
            soldPrice: soldFormData.soldPrice,
            soldDate: soldFormData.soldDate,
          }),
    };

    try {
      const token = localStorage.getItem("jwt");
      const endpoint =
        soldType === "platform"
          ? `${API_BASE_URL}/api/products/sold-platform/${selectedDeal.id}`
          : `${API_BASE_URL}/api/products/sold-outside/${selectedDeal.id}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFeedback({
          type: "success",
          message: "Deal marked as sold successfully!",
        });

        // Refresh deals list and reset form after 3 seconds
        setTimeout(async () => {
          await fetchUserDeals();
          setSoldDialogOpen(false);
          setSoldType(null);
          setSelectedDeal(null);
          setSoldFormData({
            buyerEmail: "",
            soldPrice: "",
            soldDate: "",
            soldToUniversityStudent: "no",
            sellingReason: "",
          });
          setSelectedBuyer(null);
          setFeedback({ type: "", message: "" });
        }, 2000);
      } else {
        throw new Error("Failed to mark deal as sold");
      }
    } catch (error) {
      console.error("Error marking deal as sold:", error);
      setFeedback({
        type: "error",
        message: "Failed to mark deal as sold. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSoldForm = () => {
    if (soldType === "platform") {
      return (
        <form onSubmit={handleSoldFormSubmit} className="space-y-4">
          <FeedbackAlert type={feedback.type} message={feedback.message} />
          <div>
            <Label htmlFor="buyerSelect">Select Buyer</Label>
            <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
              <SelectTrigger>
                <SelectValue placeholder="Select a buyer" />
              </SelectTrigger>
              <SelectContent>
                {interestedBuyers.map((buyer) => (
                  <SelectItem key={buyer.buyerId} value={buyer.buyerId}>
                    {buyer.buyerName} ({buyer.buyerEmail})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-center text-sm text-muted-foreground">OR</div>
          <div>
            <Label htmlFor="buyerEmail">Buyer Email</Label>
            <Input
              id="buyerEmail"
              value={soldFormData.buyerEmail}
              onChange={(e) =>
                setSoldFormData({ ...soldFormData, buyerEmail: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="soldPrice">Sold Price</Label>
            <Input
              id="soldPrice"
              type="number"
              value={soldFormData.soldPrice}
              onChange={(e) =>
                setSoldFormData({ ...soldFormData, soldPrice: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="soldDate">Sell Date</Label>
            <Input
              id="soldDate"
              type="date"
              value={soldFormData.soldDate}
              onChange={(e) =>
                setSoldFormData({ ...soldFormData, soldDate: e.target.value })
              }
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting || (!selectedBuyer && !soldFormData.buyerEmail)
            }
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </Button>
        </form>
      );
    }

    if (soldType === "outside") {
      return (
        <form onSubmit={handleSoldFormSubmit} className="space-y-4">
          <FeedbackAlert type={feedback.type} message={feedback.message} />
          <div>
            <Label>Sold to University Student?</Label>
            <RadioGroup
              value={soldFormData.soldToUniversityStudent}
              onValueChange={(value) =>
                setSoldFormData({
                  ...soldFormData,
                  soldToUniversityStudent: value,
                })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="sellingReason">Reason for Selling Outside</Label>
            <Input
              id="sellingReason"
              value={soldFormData.sellingReason}
              onChange={(e) =>
                setSoldFormData({
                  ...soldFormData,
                  sellingReason: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="soldPrice">Sold Price</Label>
            <Input
              id="soldPrice"
              type="number"
              value={soldFormData.soldPrice}
              onChange={(e) =>
                setSoldFormData({ ...soldFormData, soldPrice: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="soldDate">Sell Date</Label>
            <Input
              id="soldDate"
              type="date"
              value={soldFormData.soldDate}
              onChange={(e) =>
                setSoldFormData({ ...soldFormData, soldDate: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Submit"}
          </Button>
        </form>
      );
    }

    return null;
  };

  const ProductCard = ({ deal }) => (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="relative p-0">
        {renderDealImage(deal)}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 dark:bg-gray-700 dark:hover:bg-gray-600"
          onClick={(e) => handleEditDeal(deal, e)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-grow space-y-2 pt-4">
        <CardTitle className="line-clamp-1">{deal.name}</CardTitle>
        <p className="text-xl font-bold text-primary">
          {formatPrice(deal.price)}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {deal.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{deal.category}</Badge>
          <Badge variant="outline">{deal.condition}</Badge>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 p-4">
      <div className="flex flex-col sm:flex-row w-full gap-2">
      <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Mark as Sold
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  handleSoldButtonClick(deal, e);
                  fetchInterestedBuyers(deal.id);
                  setTempSoldType("platform");
                  setConfirmSoldDialogOpen(true);
                }}
              >
                Sold on Platform
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  handleSoldButtonClick(deal, e);
                  setTempSoldType("outside");
                  setConfirmSoldDialogOpen(true);
                }}
              >
                Sold Outside
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentDealId(deal.id);
              setRepostDialogOpen(true);
            }}
          >
            Post Again
          </Button>
        </div>

        <div className="flex justify-between w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="px-3"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem
                onClick={(e) => handleShare(deal, "whatsapp", e)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleShare(deal, "facebook", e)}
              >
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare(deal, "email", e)}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare(deal, "copy", e)}>
                <Link className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentDealId(deal.id);
              setRemoveDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  return (
    <div className="space-y-6">
      {/* New Confirmation Dialog */}
      <Dialog
        open={confirmSoldDialogOpen}
        onOpenChange={setConfirmSoldDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tempSoldType === "platform"
                ? "Sold on Platform"
                : "Sold Outside Platform"}
            </DialogTitle>
            {/* Add the feedback alert */}
            <FeedbackAlert type={feedback.type} message={feedback.message} />
            <DialogDescription>
              Would you like to share more details about this sale?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">
              Sharing details helps us improve our platform and your selling
              experience.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || feedback.type !== ""}
              onClick={() => handleConfirmShareDetails(false)}
              className="sm:w-full"
            >
              Just Mark as Sold
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || feedback.type !== ""}
              onClick={() => handleConfirmShareDetails(true)}
              className="sm:w-full"
            >
              Share Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deal Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <FeedbackAlert type={feedback.type} message={feedback.message} />

            {/* Post Again Section */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold">Post Again</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Benefits of reposting:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Appears at the top of search results</li>
                  <li>Reaches new potential buyers</li>
                  <li>Updates the posting date</li>
                </ul>
                <p className="text-yellow-600 mt-2">
                  Note: Reposting will reset all deal history including chats
                  and notifications
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repost"
                  checked={understoodRepost}
                  onCheckedChange={setUnderstoodRepost}
                />
                <label htmlFor="repost" className="text-sm">
                  I understand that reposting will reset all deal history
                </label>
              </div>
              <Button
                onClick={handleRepost}
                disabled={!understoodRepost || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Reposting..." : "Post Again"}
              </Button>
            </div>

            {/* Remove Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Remove Deal</h3>
              <div className="text-sm text-muted-foreground">
                <p>Removing this deal will permanently delete:</p>
                <ul className="list-disc pl-4 space-y-1 mt-2">
                  <li>All chat conversations</li>
                  <li>Deal statistics and analytics</li>
                  <li>All associated data and history</li>
                </ul>
              </div>
              <Textarea
                placeholder="Please provide a reason for removal"
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleRemove}
                variant="destructive"
                disabled={!removalReason || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Removing..." : "Remove Deal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={repostDialogOpen} onOpenChange={setRepostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Again</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FeedbackAlert type={feedback.type} message={feedback.message} />

            <div className="text-sm text-muted-foreground space-y-2 mb-4">
              <p>Reposting your deal can help:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Improve visibility by appearing at the top of search results
                </li>
                <li>Reach new potential buyers</li>
                <li>Update the posting date to current</li>
              </ul>
              <p className="font-medium mt-4">
                Important: Reposting will reset your deal's history, including:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-yellow-600">
                <li>All chat conversations</li>
                <li>Interested buyer notifications</li>
                <li>View and interaction statistics</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="repost"
                checked={understoodRepost}
                onCheckedChange={setUnderstoodRepost}
              />
              <label htmlFor="repost" className="text-sm">
                I understand that reposting will reset all deal history
              </label>
            </div>

            <Button
              onClick={handleRepost}
              disabled={!understoodRepost || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Reposting..." : "Post Again"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={soldDialogOpen} onOpenChange={setSoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {soldType === "platform"
                ? "Mark as Sold on Platform"
                : "Mark as Sold Outside"}
            </DialogTitle>
          </DialogHeader>
          {renderSoldForm()}
        </DialogContent>
      </Dialog>

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
            <ProductCard key={deal.id} deal={deal} />
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
