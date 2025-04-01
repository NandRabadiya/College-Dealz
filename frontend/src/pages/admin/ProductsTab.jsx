import React from "react";
import { Tag, Clock, Calendar, MapPinIcon, ChevronLeft, ChevronRight } from "lucide-react";
import ReportDialog from "./ReportDialog";

const ProductsTab = ({ products, currentImageIndexes, setCurrentImageIndexes, handleReportProduct }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Manage Products
      </h2>
      
      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          No products available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <div className="relative">
                <img
                  src={
                    product.imageUrls?.[
                      currentImageIndexes[product.id] || 0
                    ] || "https://placeholder.co/300x200"
                  }
                  alt={product.name || "Product"}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                {product.imageUrls?.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentImageIndexes((prev) => ({
                          ...prev,
                          [product.id]:
                            ((prev[product.id] || 0) -
                              1 +
                              product.imageUrls.length) %
                            product.imageUrls.length,
                        }));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors duration-200"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentImageIndexes((prev) => ({
                          ...prev,
                          [product.id]:
                            ((prev[product.id] || 0) + 1) %
                            product.imageUrls.length,
                        }));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors duration-200"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {product.imageUrls.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                            (currentImageIndexes[product.id] || 0) === index
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute top-2 right-2 z-10">
                  <ReportDialog
                    type="Product"
                    id={product.id}
                    onReport={handleReportProduct}
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="text-lg font-bold text-primary dark:text-primary">
                    ₹{product.price.toLocaleString("en-IN")}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                        {product.category}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        product.condition === "NEW"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {product.condition}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span>
                      {product.monthsOld}{" "}
                      {product.monthsOld === 1 ? "month" : "months"} old
                    </span>
                  </div>
                  {product.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span>
                      {new Date(product.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
