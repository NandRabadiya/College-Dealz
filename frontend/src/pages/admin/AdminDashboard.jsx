import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  School,
  Package,
  Trash2,
  PenSquare,
  MapPin,
  Users,
  Shield,
  AlertCircle,
  Eye,
  Mail,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  MapPinIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "../Api/api";
import { set } from "lodash";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("universities");
  const [isAddingUniversity, setIsAddingUniversity] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    location: "",
  });
  const [feedback, setFeedback] = useState([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedItemForReport, setSelectedItemForReport] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportStates, setReportStates] = useState({});

  // Fetch data
  useEffect(() => {
    fetchUniversities();
    fetchProducts();
    fetchUsers();
    fetchAdmins();
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      setFeedback(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  // Report handlers
  const handleReportUser = async (userId) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_BASE_URL}/api/reports/user/${userId}`,
        { reason: reportReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      //setReportReason("");
      alert("User warned successfully");
    } catch (error) {
      console.error("Error warning user:", error);
      alert("Failed to send warning");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleReportProduct = async (productId) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_BASE_URL}/api/reports/product/${productId}`,
        { reason: reportReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      //setReportReason("");
      alert("Product warned successfully");
    } catch (error) {
      console.error("Error warning product:", error);
      alert("Failed to send warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Report Dialog Component
  // Modified Report Dialog Component
  const ReportDialog = ({ type, id, onReport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!reason.trim()) {
        alert("Please enter a reason for the warning");
        return;
      }

      setIsSubmitting(true);
      try {
        if (type === "User") {
          await axios.post(
            `${API_BASE_URL}/api/reports/user/${id}`,
            { reason },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/api/reports/product/${id}`,
            { reason },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
          );
        }
        alert(`${type} warned successfully`);
        setIsOpen(false);
        setReason("");
      } catch (error) {
        console.error(`Error warning ${type.toLowerCase()}:`, error);
        alert("Failed to send warning");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Warn {type}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">
                Reason for warning
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Enter reason for warning this ${type.toLowerCase()}...`}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsOpen(false);
                  setReason("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? "Sending..." : "Send Warning"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };
  // Fetch functions
  // Fetch functions with proper error handling
  const fetchUniversities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/universities`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      setUniversities(response.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin_only/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  // University handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUniversity) {
        await axios.put(
          `${API_BASE_URL}/api/universities/${editingUniversity.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
          }
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/universities`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
      }
      fetchUniversities();
      setIsAddingUniversity(false);
      setEditingUniversity(null);
      setFormData({ name: "", domain: "", location: "" });
    } catch (error) {
      console.error("Error saving university:", error);
    }
  };

  const handleEdit = (university) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      domain: university.domain,
      location: university.location || "",
    });
    setIsAddingUniversity(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/universities/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      fetchUniversities();
    } catch (error) {
      console.error("Error deleting university:", error);
    }
  };

  // Admin management handlers
  // Fixed handleToggleAdmin function
  const handleToggleAdmin = async (userId, isAdmin) => {
    if (
      window.confirm(
        `Are you sure you want to ${isAdmin ? "remove" : "make"} this user ${
          isAdmin ? "from" : "an"
        } admin?`
      )
    ) {
      try {
        if (!isAdmin) {
          await axios.post(
            `${API_BASE_URL}/api/admin_only/add/${userId}`,
            {}, // Empty body object
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
          );
        } else {
          await axios.delete(
            `${API_BASE_URL}/api/admin_only/remove/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
          );
        }
        await Promise.all([fetchUsers(), fetchAdmins()]);
      } catch (error) {
        console.error("Error toggling admin status:", error);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("universities")}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  activeTab === "universities"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                <School className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Universities</span>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  activeTab === "products"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                <Package className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Products</span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  activeTab === "users"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                <Users className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Users</span>
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  activeTab === "admins"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                <Shield className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Admins</span>
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  activeTab === "feedback"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Feedback</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Universities Tab */}
        {activeTab === "universities" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Universities
              </h2>
              <button
                onClick={() => {
                  setIsAddingUniversity(true);
                  setEditingUniversity(null);
                  setFormData({ name: "", domain: "", location: "" });
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto justify-center sm:justify-start"
              >
                <PlusCircle className="h-5 w-5" />
                Add University
              </button>
            </div>

            {isAddingUniversity && (
              <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                  {editingUniversity ? "Edit University" : "Add New University"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) =>
                        setFormData({ ...formData, domain: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingUniversity(false);
                        setEditingUniversity(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {editingUniversity ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {universities.map((university) => (
                      <tr key={university.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {university.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {university.domain}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {university.location || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleEdit(university)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(university.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

 {/* Products Tab Content */}
{activeTab === "products" && (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
      Manage Products
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative">
            <img
              src={
                product.imageUrls?.[
                  currentImageIndexes[product.id] || 0
                ] || "https://placeholder.co/300x200"
              }
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            {product.imageUrls?.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndexes((prev) => ({
                      ...prev,
                      [product.id]:
                        ((prev[product.id] || 0) - 1 + product.imageUrls.length) %
                        product.imageUrls.length,
                    }))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors duration-200"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndexes((prev) => ({
                      ...prev,
                      [product.id]:
                        ((prev[product.id] || 0) + 1) %
                        product.imageUrls.length,
                    }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors duration-200"
                >
                  <ChevronRight className="h-6 w-6" />
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
            {/* Report icon moved to top right */}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {product.name}
              </h3>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{product.price.toLocaleString("en-IN")}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
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
                {/* Condition badge moved here */}
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
                  {product.monthsOld} {product.monthsOld === 1 ? "month" : "months"} old
                </span>
              </div>
              {product.location && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                  <span>{product.location}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span>
                  {new Date(product.createdAt).toLocaleDateString("en-IN", {
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
  </div>
)}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Manage Users
            </h2>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                user.profile_picture ||
                                "https://placeholder.co/40"
                              }
                              alt=""
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Joined{" "}
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.universityName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.email_verified
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {user.email_verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleToggleAdmin(user.id, false)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              Make Admin
                            </button>
                            <ReportDialog
                              type="User"
                              id={user.id}
                              onReport={handleReportUser}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === "admins" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Manage Administrators
            </h2>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {admins.map((admin) => (
                      <tr key={admin.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                admin.profile_picture ||
                                "https://via.placeholder.com/40"
                              }
                              alt=""
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {admin.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Admin since{" "}
                                {new Date(
                                  admin.admin_since
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {admin.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {universities.find(
                            (u) => u.id === admin.university_id
                          )?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleToggleAdmin(admin.id, true)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Remove Admin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Feedback Tab Content */}
        {activeTab === "feedback" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              User Feedback
            </h2>
            <div className="grid gap-6">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.userName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {item.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
