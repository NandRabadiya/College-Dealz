import React, { useState, useEffect } from "react";
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
  ELECTRONICS: "ELECTRONICS",
  FURNITURE: "FURNITURE",
  CLOTHING: "CLOTHING",
  BOOKS: "BOOKS",
  OTHER: "OTHER",
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
  const queryParams = new URLSearchParams(location.search);
  const wantlistId = queryParams.get("wantlistId");
  const navigate = useNavigate();

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

  // All the handlers remain exactly the same...
  const validate = () => {
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
  };
  const handleClose = () => {
    if (onClose) {
      onClose(); // Call the existing onClose function if provided
    }
    // Navigate back to the previous page
    navigate(-1);
  };
  const handleChange = (e) => {
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
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = formData.images.length + files.length;

    if (totalImages > 7) {
      setErrors({
        ...errors,
        images: "Maximum 7 images allowed",
      });
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...newImages],
    }));

    if (errors.images) {
      const updatedErrors = { ...errors };
      delete updatedErrors.images;
      setErrors(updatedErrors);
    }
  };

  const removeImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  const handleConditionChange = (value) => {
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
  };

  const handleCategoryChange = (value) => {
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
  };

  const handleSubmit = async (e) => {
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
        //formDataToSend.append("wantlistId", wantlistId);
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

      if (onClose) {
        onClose(true); // Pass true to indicate successful submission
      }
    } catch (error) {
      console.error("Error submitting deal:", error);
      setSubmitError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] flex items-start justify-center overflow-hidden">
        <Card className="w-full max-w-lg mx-4 my-2 border shadow-lg animate-in fade-in-0 relative">
          <CardHeader className="sticky top-0 z-10 bg-background border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {editDeal ? "Edit Deal" : wantlistId ? "Post a Deal for Wantlist" : "Post a Deal"}
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
                <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
                  You're posting a deal in response to a wantlist. The buyer will be notified when you post this deal.
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
                        <SelectItem value={CATEGORY_ENUM.ELECTRONICS}>
                          Electronics
                        </SelectItem>
                        <SelectItem value={CATEGORY_ENUM.FURNITURE}>
                          Furniture
                        </SelectItem>
                        <SelectItem value={CATEGORY_ENUM.CLOTHING}>
                          Clothing
                        </SelectItem>
                        <SelectItem value={CATEGORY_ENUM.BOOKS}>
                          Books
                        </SelectItem>
                        <SelectItem value={CATEGORY_ENUM.OTHER}>
                          Other
                        </SelectItem>
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
                      {7 - formData.images.length} images remaining
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
            {submitError && (
              <div className="w-full mb-4 p-3 text-red-600 bg-red-50 rounded-md">
                {submitError}
              </div>
            )}
            <Button
              type="submit"
              form="dealForm"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editDeal
                ? "Save Changes"
                : wantlistId
                ? "Post Deal for Wantlist"
                : "Post Deal"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PostADeal;



// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectItem,
//   SelectContent,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { X, Image as ImageIcon } from "lucide-react";
// import {
//   Card,
//   CardHeader,
//   CardContent,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { API_BASE_URL } from "../Api/api";
// import { useEffect } from "react";

// // Define enums to match backend
// const CATEGORY_ENUM = {
//   ELECTRONICS: "ELECTRONICS",
//   FURNITURE: "FURNITURE",
//   CLOTHING: "CLOTHING",
//   BOOKS: "BOOKS",
//   OTHER: "OTHER",
// };

// const CONDITION_ENUM = {
//   NEW: "NEW",
//   LIKE_NEW: "LIKE_NEW",
//   GOOD: "GOOD",
//   FAIR: "FAIR",
//   POOR: "POOR",
// };

// const PostADeal = ({ onClose, editDeal }) => {
//   // ... previous state and handlers remain the same ...
//   useEffect(() => {
//     if (editDeal) {
//       console.log("Edit deal data received:", editDeal);
//       // Initialize form with properly mapped data
//       setFormData({
//         name: editDeal.name || "",
//         description: editDeal.description || "",
//         price: editDeal.price || "",
//         condition: editDeal.condition || "",
//         category: editDeal.category || "",
//         monthsOld: editDeal.monthsOld || "",
//         images: (editDeal.imageUrls || []).map((url) => ({
//           preview: url,
//           existingUrl: url,
//         })),
//         id: editDeal.id, // Explicitly store the ID
//       });
//     }
//   }, [editDeal]);

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     condition: "",
//     category: "",
//     monthsOld: "",
//     images: [],
//     id: null,
//   });
//   const [errors, setErrors] = useState({});
//   const [submitError, setSubmitError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // All the handlers remain exactly the same...
//   const validate = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = "Name is required.";
//     if (formData.price === "" || formData.price < 0)
//       newErrors.price = "Price cannot be negative.";
//     if (!formData.monthsOld) newErrors.monthsOld = "Age in months is required.";
//     if (!formData.category) newErrors.category = "Category is required.";
//     if (!formData.condition) newErrors.condition = "Condition is required.";
//     if (formData.images.length === 0)
//       newErrors.images = "At least one image is required.";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const sanitizedValue = name === "monthsOld" ? Math.max(0, value) : value;

//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: sanitizedValue,
//     }));
//     // Clear error for the field being changed
//     if (errors[name]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[name];
//         return newErrors;
//       });
//     }
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const totalImages = formData.images.length + files.length;

//     if (totalImages > 7) {
//       setErrors({
//         ...errors,
//         images: "Maximum 7 images allowed",
//       });
//       return;
//     }

//     const newImages = files.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));

//     setFormData((prevData) => ({
//       ...prevData,
//       images: [...prevData.images, ...newImages],
//     }));

//     if (errors.images) {
//       const updatedErrors = { ...errors };
//       delete updatedErrors.images;
//       setErrors(updatedErrors);
//     }
//   };

//   const removeImage = (index) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       images: prevData.images.filter((_, i) => i !== index),
//     }));
//   };

//   const handleConditionChange = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       condition: value,
//     }));
//     if (errors.condition) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors.condition;
//         return newErrors;
//       });
//     }
//   };

//   const handleCategoryChange = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       category: value,
//     }));
//     if (errors.category) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors.category;
//         return newErrors;
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitError("");

//     if (!validate()) return;
//     // Additional validation for edit mode
//     if (editDeal && !editDeal.id) {
//       setSubmitError("Invalid product ID for editing");
//       console.error("Edit mode active but no product ID provided:", editDeal);
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       const token = localStorage.getItem("jwt");
//       if (!token) {
//         setSubmitError("Authentication token not found. Please login again.");
//         return;
//       }
//       const formDataToSend = new FormData();

//       // Append basic product details
//       formDataToSend.append("name", formData.name);
//       formDataToSend.append("description", formData.description);
//       formDataToSend.append("price", formData.price);
//       formDataToSend.append("condition", formData.condition);
//       formDataToSend.append("category", formData.category);
//       formDataToSend.append("monthsOld", formData.monthsOld);

//       // Handle new image files
//       formData.images
//         .filter((img) => img.file)
//         .forEach((image) => {
//           formDataToSend.append("images", image.file);
//         });

//       // Handle existing images
//       const existingImages = formData.images
//         .filter((img) => img.existingUrl)
//         .map((img) => img.existingUrl);

//       formDataToSend.append("existingImages", JSON.stringify(existingImages));

//       // Construct URL based on mode
//       const baseUrl = `${API_BASE_URL}/api/products`;
//       const url = formData.id
//         ? `${baseUrl}/${formData.id}`
//         : `${baseUrl}/create`;
//       const method = formData.id ? "PUT" : "POST";

//       console.log("Making request to:", url);
//       console.log("Method:", method);
//       console.log("Form data ID:", formData.id);

//       const response = await fetch(url, {
//         method,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formDataToSend,
//       });
//       // Try to parse JSON response, but handle non-JSON responses gracefully

//       if (!response.ok) {
//         let errorMessage = `HTTP error! status: ${response.status}`;
//         try {
//           const errorData = await response.json();
//           errorMessage = errorData.message || errorMessage;
//         } catch {
//           console.error("Non-JSON error response received.");
//         }
//         throw new Error(errorMessage);
//       }

//       // If we get here, the request was successful
//       // Clean up any object URLs we created
//       formData.images.forEach((image) => {
//         if (image.preview && !image.existingUrl) {
//           URL.revokeObjectURL(image.preview);
//         }
//       });

//       if (onClose) {
//         onClose(true); // Pass true to indicate successful submission
//       }
//     } catch (error) {
//       console.error("Error submitting deal:", error);
//       setSubmitError(
//         error.message || "An unexpected error occurred. Please try again."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   return (
//     <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
//       <div className="w-full h-full md:h-auto md:max-h-[90vh] flex items-start justify-center overflow-hidden">
//         <Card className="w-full max-w-lg mx-4 my-2 border shadow-lg animate-in fade-in-0 relative">
//           <CardHeader className="sticky top-0 z-10 bg-background border-b">
//             <div className="flex justify-between items-center">
//               <CardTitle className="text-2xl font-bold">
//                 {editDeal ? "Edit Deal" : "Post a Deal"}
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="rounded-full hover:bg-muted"
//                 onClick={onClose}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           </CardHeader>

//           <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
//             <CardContent className="p-4">
//               <form id="dealForm" onSubmit={handleSubmit} className="space-y-6">
//                 {/* Name */}
//                 <div className="space-y-2">
//                   <Label htmlFor="name" className="text-sm font-medium">
//                     Name
//                   </Label>
//                   <Input
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="Enter the name of the item"
//                     className={`${
//                       errors.name ? "border-red-500" : ""
//                     } transition-colors`}
//                   />
//                   {errors.name && (
//                     <p className="text-sm text-red-500">{errors.name}</p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Price */}
//                   <div className="space-y-2">
//                     <Label htmlFor="price" className="text-sm font-medium">
//                       Price
//                     </Label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
//                         ₹
//                       </span>
//                       <Input
//                         type="number"
//                         id="price"
//                         name="price"
//                         value={formData.price}
//                         onChange={handleChange}
//                         placeholder="0.00"
//                         className={`pl-7 ${
//                           errors.price ? "border-red-500" : ""
//                         } transition-colors`}
//                       />
//                     </div>
//                     {errors.price && (
//                       <p className="text-sm text-red-500">{errors.price}</p>
//                     )}
//                   </div>

//                   {/* Months Old */}
//                   <div className="space-y-2">
//                     <Label htmlFor="monthsOld" className="text-sm font-medium">
//                       Age (months)
//                     </Label>
//                     <Input
//                       type="number"
//                       id="monthsOld"
//                       name="monthsOld"
//                       value={formData.monthsOld}
//                       onChange={handleChange}
//                       placeholder="0"
//                       className={`${
//                         errors.monthsOld ? "border-red-500" : ""
//                       } transition-colors`}
//                     />
//                     {errors.monthsOld && (
//                       <p className="text-sm text-red-500">{errors.monthsOld}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Category */}
//                   <div className="space-y-2">
//                     <Label htmlFor="category" className="text-sm font-medium">
//                       Category
//                     </Label>
//                     <Select
//                       value={formData.category}
//                       onValueChange={handleCategoryChange}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select a category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value={CATEGORY_ENUM.ELECTRONICS}>
//                           Electronics
//                         </SelectItem>
//                         <SelectItem value={CATEGORY_ENUM.FURNITURE}>
//                           Furniture
//                         </SelectItem>
//                         <SelectItem value={CATEGORY_ENUM.CLOTHING}>
//                           Clothing
//                         </SelectItem>
//                         <SelectItem value={CATEGORY_ENUM.BOOKS}>
//                           Books
//                         </SelectItem>
//                         <SelectItem value={CATEGORY_ENUM.OTHER}>
//                           Other
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.category && (
//                       <p className="text-sm text-red-500">{errors.category}</p>
//                     )}
//                   </div>

//                   {/* Condition */}
//                   <div className="space-y-2">
//                     <Label htmlFor="condition" className="text-sm font-medium">
//                       Condition
//                     </Label>
//                     <Select
//                       value={formData.condition}
//                       onValueChange={handleConditionChange}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select condition" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value={CONDITION_ENUM.NEW}>New</SelectItem>
//                         <SelectItem value={CONDITION_ENUM.LIKE_NEW}>
//                           Like New
//                         </SelectItem>
//                         <SelectItem value={CONDITION_ENUM.GOOD}>
//                           Good
//                         </SelectItem>
//                         <SelectItem value={CONDITION_ENUM.FAIR}>
//                           Fair
//                         </SelectItem>
//                         <SelectItem value={CONDITION_ENUM.POOR}>
//                           Poor
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.condition && (
//                       <p className="text-sm text-red-500">{errors.condition}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div className="space-y-2">
//                   <Label htmlFor="description" className="text-sm font-medium">
//                     Description
//                   </Label>
//                   <Textarea
//                     id="description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     placeholder="Provide a brief description"
//                     className="h-32 resize-none"
//                   />
//                 </div>

//                 {/* Images */}
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center mb-1">
//                     <Label className="text-sm font-medium">
//                       Product Images
//                     </Label>
//                     {errors.images && (
//                       <p className="text-sm text-red-500">{errors.images}</p>
//                     )}
//                     <span className="text-sm text-muted-foreground">
//                       {7 - formData.images.length} images remaining
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-3">
//                     {formData.images.map((image, index) => (
//                       <div
//                         key={image.file?.name || index}
//                         className="relative group aspect-square"
//                       >
//                         <img
//                           src={image.preview}
//                           alt={`Product ${index + 1}`}
//                           className="w-full h-full object-cover rounded-lg transition-transform hover:scale-105"
//                         />
//                         <Button
//                           type="button"
//                           variant="destructive"
//                           size="icon"
//                           className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                           onClick={() => removeImage(index)}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                     {formData.images.length < 7 && (
//                       <div className="relative aspect-square">
//                         <Input
//                           type="file"
//                           name="images"
//                           accept="images/*"
//                           multiple
//                           onChange={handleImageUpload}
//                           className="hidden"
//                           id="image-upload"
//                         />
//                         <Label
//                           htmlFor="image-upload"
//                           className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
//                         >
//                           <ImageIcon className="w-6 h-6 mb-2" />
//                           <span className="text-sm text-muted-foreground">
//                             Add Images
//                           </span>
//                         </Label>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </form>
//             </CardContent>
//           </div>

//           <CardFooter className="sticky bottom-0 z-10 bg-background border-t p-4">
//             <Button
//               type="submit"
//               form="dealForm"
//               className="w-full"
//               disabled={isSubmitting}
//             >
//               {isSubmitting
//                 ? "Saving..."
//                 : editDeal
//                 ? "Save Changes"
//                 : "Post Deal"}
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default PostADeal;
