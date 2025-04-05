import React, { useState, useEffect } from "react";
import {
  Tag,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  School,
} from "lucide-react";
import ReportDialog from "./ReportDialog";
import { API_BASE_URL } from "../Api/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductsTab = ({ products, currentImageIndexes, setCurrentImageIndexes, handleReportProduct }) => {
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [universities, setUniversities] = useState({});

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/universities/public`);
        if (!response.ok) throw new Error("Failed to fetch community");
        const data = await response.json();
        const universityMap = {};
        data.forEach((uni) => {
          universityMap[uni.id] = uni.name;
        });
        setUniversities(universityMap);
      } catch (err) {
        console.error("Error fetching community:", err);
      }
    };
    fetchUniversities();
  }, []);

  const filteredProducts = selectedUniversity === "all"
    ? [...products].sort((a, b) => (universities[a.universityId] || "").localeCompare(universities[b.universityId] || ""))
    : products.filter(product => product.universityId.toString() === selectedUniversity);

  return (
    <div className="animate-fade-in">      
      <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
        <SelectTrigger>
          <SelectValue placeholder="Select University" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {Object.entries(universities).map(([id, name]) => (
            <SelectItem key={id} value={id}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          No products available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="relative">
                <img
                  src={product.imageUrls?.[currentImageIndexes[product.id] || 0] || "https://placeholder.co/300x200"}
                  alt={product.name || "Product"}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 z-10">
                  <ReportDialog type="Product" id={product.id} onReport={handleReportProduct} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                  <div className="text-lg font-bold text-primary dark:text-primary">₹{product.price.toLocaleString("en-IN")}</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                        {product.category}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      product.condition === "NEW"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {product.condition}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span>{product.monthsOld} {product.monthsOld === 1 ? "year" : "years"} old</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <School className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                        {universities[product.universityId] || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span>
                      {new Date(product.postDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
