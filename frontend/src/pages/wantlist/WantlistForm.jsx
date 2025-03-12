import React from "react";
import { X } from "lucide-react";

const CATEGORY_ENUM = {
  ELECTRONICS: "ELECTRONICS",
  FURNITURE: "FURNITURE",
  CLOTHING: "CLOTHING",
  BOOKS: "BOOKS",
  OTHER: "OTHER",
};

function WantlistForm({ onClose, onSubmit, initialData }) {
  const [formData, setFormData] = React.useState({
    productName: initialData?.productName || "",
    category: initialData?.category || CATEGORY_ENUM.OTHER,
    description: initialData?.description || "",
    priceMin: initialData?.priceMin || "",
    priceMax: initialData?.priceMax || "",
    monthsOldMax: initialData?.monthsOldMax || "",
  });

  const [isValid, setIsValid] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const validatePrices = () => {
    if (Number(formData.priceMax) <= Number(formData.priceMin)) {
      setErrors({
        ...errors,
        price: "Maximum price must be greater than minimum price"
      });
      return false;
    }
    
    setErrors({
      ...errors,
      price: null
    });
    return true;
  };
  // 2. Create a validateForm function that checks all fields
  const validateForm = () => {
    // Check that all required fields are filled
    const requiredFieldsFilled =
      formData.productName.trim() !== "" &&
      formData.priceMin !== "" &&
      formData.priceMax !== "" &&
      formData.monthsOldMax !== "";

    // Check that max price > min price
    const pricesValid = Number(formData.priceMax) > Number(formData.priceMin);

    // Update the isValid state
    setIsValid(requiredFieldsFilled && pricesValid);

    // Return validation result for price comparison
    if (!pricesValid && formData.priceMin && formData.priceMax) {
      setErrors({
        ...errors,
        price: "Maximum price must be greater than minimum price",
      });
      return false;
    }

    setErrors({
      ...errors,
      price: null,
    });
    return true;
  };

  // 3. Modify the handleSubmit function to handle loading, success and auto-close
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Call the onSubmit prop (which should return a Promise)
        await onSubmit(formData);

        // Show success message
        setSubmitSuccess(true);

        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } catch (error) {
        // Handle submission error if needed
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 4. Add useEffect to validate form whenever formData changes
  React.useEffect(() => {
    validateForm();
  }, [formData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {initialData ? "Edit Wantlist Item" : "Add to Wantlist"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => {
                setFormData({ ...formData, productName: e.target.value });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {Object.keys(CATEGORY_ENUM).map((key) => (
                <option key={key} value={CATEGORY_ENUM[key]}>
                  {CATEGORY_ENUM[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Min Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.priceMin}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData({ ...formData, priceMin: newValue });
                  if (formData.priceMax && newValue) {
                    validatePrices();
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.priceMax}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData({ ...formData, priceMax: newValue });
                  if (formData.priceMin && newValue) {
                    validatePrices();
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product is used for (in year(s))
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.monthsOldMax}
              onChange={(e) =>
                setFormData({ ...formData, monthsOldMax: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full ${
              isValid && !isSubmitting
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 cursor-not-allowed"
            } text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
          >
            {isSubmitting
              ? "Adding product to your wantlist..."
              : initialData
              ? "Update Item"
              : "Add Item"}
          </button>
          {submitSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-center">
              Product successfully added to your wantlist!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default WantlistForm;
