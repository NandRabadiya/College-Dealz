import React, { useState } from "react";
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

const PostADeal = ({ onClose, editDeal }) => {
  // ... previous state and handlers remain the same ...
  const [formData, setFormData] = useState({
    name: editDeal?.name || "",
    description: editDeal?.description || "",
    price: editDeal?.price || "",
    condition: editDeal?.condition || "",
    category: editDeal?.category || "",
    monthsOld: editDeal?.monthsOld || "",
    images: Array.isArray(editDeal?.images)
      ? editDeal.images.map((url) => ({ preview: url }))
      : [],
  });
  const [errors, setErrors] = useState({});

  // All the handlers remain exactly the same...
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be greater than ₹0.";
    if (!formData.monthsOld) newErrors.monthsOld = "Age in months is required.";
    if (formData.images.length === 0)
      newErrors.images = "At least one image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue =
      name === "price" || name === "monthsOld" ? Math.max(0, value) : value;

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: sanitizedValue };
      const updatedErrors = { ...errors };
      if (name === "name" && updatedData.name.trim()) delete updatedErrors.name;
      if (name === "price" && +updatedData.price > 0)
        delete updatedErrors.price;
      if (name === "monthsOld" && +updatedData.monthsOld > 0)
        delete updatedErrors.monthsOld;
      setErrors(updatedErrors);
      return updatedData;
    });
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

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const token = localStorage.getItem("token"); // Get your auth token
        const formDataToSend = new FormData();

        Object.keys(formData).forEach((key) => {
          if (key !== "images") {
            formDataToSend.append(key, formData[key]);
          }
        });

        formData.images.forEach((image, index) => {
          if (image.file) {
            formDataToSend.append("images", image.file);
          }
        });

        const response = await fetch(
          `${API_BASE_URL}/api/products/${editDeal ? editDeal.id : ""}`,
          {
            method: editDeal ? "PUT" : "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataToSend,
          }
        );

        if (response.ok) {
          onClose();
        }
      } catch (error) {
        console.log("Error submitting deal:", error);
      }
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] flex items-start justify-center overflow-hidden">
        <Card className="w-full max-w-lg mx-4 my-2 border shadow-lg animate-in fade-in-0 relative">
          <CardHeader className="sticky top-0 z-10 bg-background border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {" "}
                {editDeal ? "Edit Deal" : "Post a Deal"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            <CardContent className="p-4">
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
                      Age (months)
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
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-sm font-medium">
                      Condition
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) =>
                        handleChange({ target: { name: "condition", value } })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
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
                          accept="image/*"
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
            <Button type="submit" form="dealForm" className="w-full">
              {editDeal ? "Save Changes" : "Post Deal"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PostADeal;
