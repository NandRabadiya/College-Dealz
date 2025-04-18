import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit2, Trash2, Aperture, Tag, Info, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WantlistForm from "./WantlistForm";
import { API_BASE_URL } from "../Api/api";
import WantlistPageTour from "./WantlistPageTour";
import { Skeleton } from "@/components/ui/skeleton";

function Wantlist() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [allWantlist, setAllWantlist] = useState([]);
  const [myWantlist, setMyWantlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my'
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ message: "", type: "" });
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState({
    message: "",
    type: "",
  });
  const [clickedButton, setClickedButton] = useState(null); // Track which button was clicked

  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteReason, setDeleteReason] = useState(null);

  useEffect(() => {
    fetchWantlists();
  }, []);

  const fetchWantlists = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all wantlist items
      const allResponse = await fetch(
        `${API_BASE_URL}/api/wantlist/all/university`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      const allData = await allResponse.json();
      setAllWantlist(allData);

      // Endpoint for my wantlist items
      const myResponse = await fetch(`${API_BASE_URL}/api/wantlist/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      const myData = await myResponse.json();
      setMyWantlist(myData);
    } catch (error) {
      console.error("Error fetching wantlists:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, data);
      } else {
        await addItem(data);
      }
      setFormFeedback({ message: "Successfully saved!", type: "success" });
      setTimeout(() => {
        setShowForm(false);
        setEditingItem(null);
        setFormFeedback({ message: "", type: "" });
      }, 2500);
    } catch (error) {
      setFormFeedback({
        message: "Error saving item. Please try again.",
        type: "error",
      });
      setTimeout(() => {
        setFormFeedback({ message: "", type: "" });
      }, 2500);
      setIsSubmitting(false);
    }
  }, [editingItem]);

  const addItem = useCallback(async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wantlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add item");
      const newItem = await response.json();
      setMyWantlist(prevItems => [...prevItems, newItem]);
      setAllWantlist(prevItems => [...prevItems, newItem]);
      return newItem;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wantlist/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update item");
      const updatedItem = await response.json();
      setMyWantlist(prevItems =>
        prevItems.map((item) => (item.id === id ? updatedItem : item))
      );
      setAllWantlist(prevItems =>
        prevItems.map((item) => (item.id === id ? updatedItem : item))
      );
      return updatedItem;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setShowForm(true);
  }, []);

  const initiateDelete = useCallback((id) => {
    setDeleteItemId(id);
    setShowDeleteDialog(true);
  }, []);

  const handleDelete = useCallback(async (reason) => {
    if (!deleteItemId) return;

    setClickedButton(reason); // Store which button was clicked
    setIsDeletingItem(true);

    try {
      await deleteItem(deleteItemId, reason);
      setMyWantlist(prevItems => prevItems.filter((item) => item.id !== deleteItemId));
      setAllWantlist(prevItems => prevItems.filter((item) => item.id !== deleteItemId));

      setDeleteFeedback({
        message: "Item removed successfully!",
        type: "success",
      });
      setTimeout(() => {
        setShowDeleteDialog(false);
        setDeleteItemId(null);
        setClickedButton(null);
        setDeleteFeedback({ message: "", type: "" });
        setIsDeletingItem(false);
      }, 2500);
    } catch (error) {
      setDeleteFeedback({
        message: "Error removing item. Please try again.",
        type: "error",
      });
      setTimeout(() => {
        setDeleteFeedback({ message: "", type: "" });
        setClickedButton(null);
        setIsDeletingItem(false);
      }, 2500);
    }
  }, [deleteItemId]);

  const deleteItem = useCallback(async (id, reason) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      throw new Error("JWT token not found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/wantlist/remove/${id}?reason=${encodeURIComponent(
        reason
      )}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to remove item: ${response.statusText}`);
    }

    return await response.text();
  }, []);

  const handlePostDeal = useCallback((wantlistData) => {
    // Logic to navigate to post a deal page with wantlist data
    navigate(`/post-a-deal?wantlistId=${wantlistData.id}`);
  }, [navigate]);

  // Format date
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

  const currentWantlist = useMemo(() => 
    activeTab === "all" ? allWantlist : myWantlist
  , [activeTab, allWantlist, myWantlist]);

  const renderSkeletons = useMemo(() => {
    return Array(4).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-7 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-16 w-full mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full col-span-2 sm:col-span-1" />
        </div>
      </div>
    ));
  }, []);

  return (
    <div className="wantlist-page">
      {/* <WantlistPageTour /> */}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Wantlist
            </h1>

            <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto w-full sm:w-auto">
              <button
                onClick={() => setShowInfoDialog(true)}
                className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-2 rounded-lg transition-colors"
                aria-label="Information about Wantlist"
              >
                <Info size={18} />
              </button>
              <button
                id="add-items"
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                }}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base flex-1 sm:flex-none"
              >
                <Plus size={18} />
                <span>Add Item You Want</span>
              </button>
            </div>
          </div>

          <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 min-w-max">
              <button
                id="all-wantlist"
                onClick={() => setActiveTab("all")}
                className={`py-3 sm:py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                All Products
              </button>
              <button
                id="my-wantlist"
                onClick={() => setActiveTab("my")}
                className={`py-3 sm:py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeTab === "my"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                My Wantlist
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {renderSkeletons}
            </div>
          ) : currentWantlist.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
                {activeTab === "all"
                  ? "No products available"
                  : "Your wantlist is empty"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                {activeTab === "all"
                  ? "There are currently no products in the wantlist."
                  : 'Start adding items you\'re looking for by clicking the "Add Item You Want" button.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {currentWantlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-all hover:shadow-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate pr-2">
                      {item.productName}
                    </h3>

                    <div className="flex gap-2 ml-2 shrink-0">
                      {activeTab === "all" ? (
                        <button
                          onClick={() => handlePostDeal(item)}
                          className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          aria-label="Post deal"
                        >
                          <Plus size={14} />
                          <span className="hidden sm:inline">Post Deal</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            aria-label="Edit item"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => initiateDelete(item.id)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            aria-label="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-block px-2 py-1 text-xs sm:text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded">
                      <span className="font-medium block mb-1">
                        Price Range
                      </span>
                      ₹{item.priceMin} - ₹{item.priceMax}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded">
                      <span className="font-medium block mb-1">
                        Product is used for (in year(s))
                      </span>
                      {item.monthsOldMax} year(s)
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded col-span-2 sm:col-span-1">
                      <span className="font-medium block mb-1">Updated</span>
                      {formatDate(item.updatedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showForm && (
            <WantlistForm
              onClose={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
              onSubmit={handleSubmit}
              initialData={editingItem}
              isSubmitting={isSubmitting}
              feedback={formFeedback}
            />
          )}

          {/* Info Dialog */}
          {showInfoDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
                <button
                  onClick={() => setShowInfoDialog(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-3">
                    <Info size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    What is a Wantlist?
                  </h3>
                </div>

                <div className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                  <p>
                    A{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Wantlist
                    </span>{" "}
                    is a place to add items you're looking for but haven't found
                    yet.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Others can see what you're looking for</li>
                    <li>Sellers can offer deals if they have them</li>
                    <li>Get notified when your items become available</li>
                  </ul>
                  <p>It's like a wishlist, but powered by the community! ✨</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowInfoDialog(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteItemId(null);
                    setDeleteReason(null);
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 mb-3">
                    <Trash2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Remove from Wantlist
                  </h3>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                    Did you find the product on the platform?
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {deleteFeedback.message ? (
                      <div
                        className={`text-center p-2 rounded ${
                          deleteFeedback.type === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {deleteFeedback.message}
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDelete("yes")}
                          disabled={isDeletingItem}
                          className={`w-full py-2 px-4 ${
                            isDeletingItem
                              ? "bg-blue-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white rounded-lg transition-colors flex justify-center items-center`}
                        >
                          {isDeletingItem && clickedButton === "yes" ? (
                            <>
                              <Aperture className="animate-spin h-4 w-4 mr-2" />
                              Processing...
                            </>
                          ) : (
                            "Yes"
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete("no")}
                          disabled={isDeletingItem}
                          className={`w-full py-2 px-4 ${
                            isDeletingItem
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                          } text-gray-800 dark:text-gray-200 rounded-lg transition-colors flex justify-center items-center`}
                        >
                          {isDeletingItem && clickedButton === "no" ? (
                            <>
                              <Aperture className="animate-spin h-4 w-4 mr-2" />
                              Processing...
                            </>
                          ) : (
                            "No"
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete("no_longer_needed")}
                          disabled={isDeletingItem}
                          className={`w-full py-2 px-4 ${
                            isDeletingItem
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                          } text-gray-800 dark:text-gray-200 rounded-lg transition-colors flex justify-center items-center`}
                        >
                          {isDeletingItem &&
                          clickedButton === "no_longer_needed" ? (
                            <>
                              <Aperture className="animate-spin h-4 w-4 mr-2" />
                              Processing...
                            </>
                          ) : (
                            "No longer needed"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wantlist;