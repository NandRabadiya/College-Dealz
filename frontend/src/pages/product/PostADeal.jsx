import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Image as ImageIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { API_BASE_URL } from "../Api/api";
import { useLocation, useNavigate } from "react-router-dom";

// Define enums to match backend
const CATEGORY_ENUM = {
  FURNITURE: "FURNITURE",
  ELECTRONICS: "ELECTRONICS",
  LAB_EQUIPMENT: "LAB_EQUIPMENT",
  BOOKS: "BOOKS",
  SPORTS: "SPORTS",
  STATIONERY: "STATIONERY",
  CLOTHING: "CLOTHING",
  HOSTEL_SUPPLIES: "HOSTEL_SUPPLIES",
  MUSICAL_INSTRUMENTS: "MUSICAL_INSTRUMENTS",
  VEHICLES: "VEHICLES",
  OTHER: "OTHER",
  STUDY_MATERIALS: "STUDY_MATERIALS",
};
const categoryLabels = {
  FURNITURE: "Furniture",
  ELECTRONICS: "Electronics",
  LAB_EQUIPMENT: "Lab Equipment",
  BOOKS: "Books",
  SPORTS: "Sports",
  STATIONERY: "Stationery",
  CLOTHING: "Clothing",
  HOSTEL_SUPPLIES: "Hostel Supplies",
  MUSICAL_INSTRUMENTS: "Musical Instruments",
  VEHICLES: "Vehicles",
  OTHER: "Other",
  STUDY_MATERIALS: "Study Materials",
};
const CONDITION_ENUM = {
  NEW: "NEW",
  LIKE_NEW: "LIKE_NEW",
  GOOD: "GOOD",
  FAIR: "FAIR",
  POOR: "POOR",
};

const PostADeal = ({ onClose, editDeal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use useMemo for query param extraction to avoid recalculation on re-renders
  const wantlistId = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("wantlistId");
  }, [location.search]);
  
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "success" or "error"
  const [showFeedback, setShowFeedback] = useState(false);
  const [removedImages, setRemovedImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    condition: "",
    category: "",
    monthsOld: "",
    images: [],
    id: null,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle edit deal data
  useEffect(() => {
    if (editDeal) {
      console.log("Edit deal data received:", editDeal);
      // Initialize form with properly mapped data
      setFormData({
        name: editDeal.name || "",
        description: editDeal.description || "",
        price: editDeal.price || "",
        condition: editDeal.condition || "",
        category: editDeal.category || "",
        monthsOld: editDeal.monthsOld || "",
        images: (editDeal.imageUrls || []).map((url) => ({
          preview: url,
          existingUrl: url,
        })),
        id: editDeal.id, // Explicitly store the ID
      });
    }
  }, [editDeal]);

  // Use useCallback for form validation to prevent recreation on re-renders
  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (formData.price === "" || formData.price < 0)
      newErrors.price = "Price cannot be negative.";
    if (!formData.monthsOld) newErrors.monthsOld = "Age in months is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.condition) newErrors.condition = "Condition is required.";
    if (formData.images.length === 0)
      newErrors.images = "At least one image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  // Use useCallback for event handlers to prevent recreation on re-renders
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose(); // Call the existing onClose function if provided
    }
    // Navigate back to the previous page
    navigate(-1);
  }, [onClose, navigate]);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitizedValue = name === "monthsOld" ? Math.max(0, value) : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const totalImages = formData.images.length + files.length;
  
    if (totalImages > 7) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 7 images allowed",
      }));
      return;
    }
  
    // Process each file with compression
    const processFile = async (file) => {
      // Only process image files
      if (!file.type.startsWith('image/')) {
        return {
          file,
          preview: URL.createObjectURL(file),
        };
      }
  
      // Create an image element
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            
            // Calculate new dimensions (max 1200px width/height)
            let width = img.width;
            let height = img.height;
            const maxSize = 1200;
            
            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with reduced quality
            canvas.toBlob((blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              resolve({
                file: compressedFile,
                preview: URL.createObjectURL(compressedFile),
              });
            }, 'image/jpeg', 0.7); // Adjust quality (0.7 = 70%)
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    };
  
    // Process all files and update state
    Promise.all(files.map(processFile))
      .then((compressedImages) => {
        setFormData((prevData) => ({
          ...prevData,
          images: [...prevData.images, ...compressedImages],
        }));
  
        if (errors.images) {
          setErrors((prev) => {
            const updatedErrors = { ...prev };
            delete updatedErrors.images;
            return updatedErrors;
          });
        }
      });
  }, [formData.images.length, errors.images]);
  const removeImage = useCallback((index) => {
    const imageToRemove = formData.images[index];
    
    // If this is an existing image (has existingUrl), track it for backend deletion
    if (imageToRemove.existingUrl) {
      setRemovedImages(prev => [...prev, imageToRemove.existingUrl]);
    }
    
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  }, [formData.images]);

  const handleConditionChange = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      condition: value,
    }));
    if (errors.condition) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.condition;
        return newErrors;
      });
    }
  }, [errors.condition]);

  const handleCategoryChange = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
    if (errors.category) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  }, [errors.category]);
  
  const handleSubmitSuccess = useCallback(() => {
    setFeedbackMessage("Deal posted successfully!");
    setFeedbackType("success");
    setShowFeedback(true);

    // Auto close after 2.5 seconds
    setTimeout(() => {
      handleClose();
    }, 2500);
  }, [handleClose]);
  
  // Calculate remaining images with useMemo
  const remainingImages = useMemo(() => 7 - formData.images.length, [formData.images.length]);
  
  // Create title text with useMemo
  const titleText = useMemo(() => {
    if (editDeal) return "Edit Deal";
    if (wantlistId) return "Post a Deal for Wantlist";
    return "Post a Deal";
  }, [editDeal, wantlistId]);
  
  // Submit button text with useMemo
  const submitButtonText = useMemo(() => {
    if (isSubmitting) return "Saving...";
    if (editDeal) return "Save Changes";
    if (wantlistId) return "Post Deal for Wantlist";
    return "Post Deal";
  }, [isSubmitting, editDeal, wantlistId]);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError("");
  
    if (!validate()) return;
    // Additional validation for edit mode
    if (editDeal && !editDeal.id) {
      setSubmitError("Invalid product ID for editing");
      console.error("Edit mode active but no product ID provided:", editDeal);
      return;
    }
  
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("jwt");
      if (!token) {
        setSubmitError("Authentication token not found. Please login again.");
        return;
      }
      const formDataToSend = new FormData();
  
      // Append basic product details
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("monthsOld", formData.monthsOld);
  
      // Handle new image files
      formData.images
        .filter((img) => img.file)
        .forEach((image) => {
          formDataToSend.append("images", image.file);
        });
  
      // Handle existing images
      const existingImages = formData.images
        .filter((img) => img.existingUrl)
        .map((img) => img.existingUrl);
  
      formDataToSend.append("existingImages", JSON.stringify(existingImages));
      
      // Add removed images to be deleted from S3
      if (removedImages.length > 0) {
        removedImages.forEach((url) =>
          formDataToSend.append("removeImagesUrls", url)
        );
      }
  
      // Construct URL based on mode (edit, create, or create-from-wantlist)
      let url;
      let method = "POST";
  
      if (formData.id) {
        // Edit mode
        url = `${API_BASE_URL}/api/products/${formData.id}`;
        method = "PUT";
      } else if (wantlistId) {
        // Create from wantlist mode
        url = `${API_BASE_URL}/api/products/create-from-wantlist?WantlistId=${wantlistId}`;
      } else {
        // Regular create mode
        url = `${API_BASE_URL}/api/products/create`;
      }
  
      console.log("Making request to:", url);
      console.log("Method:", method);
      console.log("Form data ID:", formData.id);
      if (wantlistId) console.log("Wantlist ID:", wantlistId);
  
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
  
      // Try to parse JSON response, but handle non-JSON responses gracefully
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          console.error("Non-JSON error response received.");
        }
        throw new Error(errorMessage);
      }
  
      // If we get here, the request was successful
      // Clean up any object URLs we created
      formData.images.forEach((image) => {
        if (image.preview && !image.existingUrl) {
          URL.revokeObjectURL(image.preview);
        }
      });
  
      // Show success message and auto-close
      setFeedbackMessage(
        formData.id
          ? "Deal updated successfully!"
          : wantlistId
          ? "Deal posted for wantlist successfully!"
          : "Deal posted successfully!"
      );
      setFeedbackType("success");
      setShowFeedback(true);
  
      // Auto close after 2.5 seconds
      setTimeout(() => {
        if (onClose) {
          onClose(true);
        }
      
        if (formData.id) {
          // Edit mode
          navigate("/dashboard");
        } else {
          // Post (create) mode
          navigate("/");
        }
      }, 2500);
      
    } catch (error) {
      console.error("Error submitting deal:", error);
      setFeedbackMessage(
        error.message || "An unexpected error occurred. Please try again."
      );
      setFeedbackType("error");
      setShowFeedback(true);
  
      // Clear feedback after 2.5 seconds
      setTimeout(() => {
        setShowFeedback(false);
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, editDeal, formData, removedImages, wantlistId, navigate, onClose]);

  // Memoize the category options to prevent recreation on re-renders
  const categoryOptions = useMemo(() => 
    Object.entries(CATEGORY_ENUM).map(([key, value]) => (
      <SelectItem key={value} value={value}>
        {categoryLabels[key] || value}
      </SelectItem>
    )), 
    []
  );

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] flex items-start justify-center overflow-hidden">
        <Card className="w-full max-w-lg mx-4 my-2 border shadow-lg animate-in fade-in-0 relative">
          <CardHeader className="sticky top-0 z-10 bg-background border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {titleText}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            <CardContent className="p-4">
              {wantlistId && (
                <div
                  className="mb-4 p-3 rounded-md text-sm 
               bg-blue-50 text-blue-900 
               dark:bg-blue-900 dark:text-blue-100"
                >
                  You're posting a deal in response to a wantlist. The buyer
                  will be notified when you post this deal.
                </div>
              )}

              <form id="dealForm" onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter the name of the item"
                    className={`${
                      errors.name ? "border-red-500" : ""
                    } transition-colors`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`pl-7 ${
                          errors.price ? "border-red-500" : ""
                        } transition-colors`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  {/* Months Old */}
                  <div className="space-y-2">
                    <Label htmlFor="monthsOld" className="text-sm font-medium">
                      Product is used for (in year(s))
                    </Label>
                    <Input
                      type="number"
                      id="monthsOld"
                      name="monthsOld"
                      value={formData.monthsOld}
                      onChange={handleChange}
                      placeholder="0"
                      className={`${
                        errors.monthsOld ? "border-red-500" : ""
                      } transition-colors`}
                    />
                    {errors.monthsOld && (
                      <p className="text-sm text-red-500">{errors.monthsOld}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-sm font-medium">
                      Condition
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={handleConditionChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CONDITION_ENUM.NEW}>New</SelectItem>
                        <SelectItem value={CONDITION_ENUM.LIKE_NEW}>
                          Like New
                        </SelectItem>
                        <SelectItem value={CONDITION_ENUM.GOOD}>
                          Good
                        </SelectItem>
                        <SelectItem value={CONDITION_ENUM.FAIR}>
                          Fair
                        </SelectItem>
                        <SelectItem value={CONDITION_ENUM.POOR}>
                          Poor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="text-sm text-red-500">{errors.condition}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a brief description"
                    className="h-32 resize-none"
                  />
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm font-medium">
                      Product Images
                    </Label>
                    {errors.images && (
                      <p className="text-sm text-red-500">{errors.images}</p>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {remainingImages} images remaining
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-3">
                    {formData.images.map((image, index) => (
                      <div
                        key={image.file?.name || index}
                        className="relative group aspect-square"
                      >
                        <img
                          src={image.preview}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg transition-transform hover:scale-105"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {formData.images.length < 7 && (
                      <div className="relative aspect-square">
                        <Input
                          type="file"
                          name="images"
                          accept="images/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        >
                          <ImageIcon className="w-6 h-6 mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Add Images
                          </span>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </div>

          <CardFooter className="sticky bottom-0 z-10 bg-background border-t p-4">
            {showFeedback && (
              <div
                className={`w-full mb-4 p-3 rounded-md ${
                  feedbackType === "success"
                    ? "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-200"
                    : "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-200"
                }`}
              >
                {feedbackMessage}
              </div>
            )}
            <Button
              type="submit"
              form="dealForm"
              className="w-full"
              disabled={isSubmitting || showFeedback}
            >
              {submitButtonText}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PostADeal;