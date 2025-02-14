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
} from "lucide-react";
import { API_BASE_URL } from "../Api/api";

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

  // Fetch data
  useEffect(() => {
    fetchUniversities();
    fetchProducts();
    fetchUsers();
    fetchAdmins();
  }, []);

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
    if (window.confirm(
      `Are you sure you want to ${isAdmin ? "remove" : "make"} this user ${
        isAdmin ? "from" : "an"
      } admin?`
    )) {
      try {
        if (!isAdmin) {
          await axios.post(
            `${API_BASE_URL}/api/admin_only/add/${userId}`,
            {},  // Empty body object
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="space-x-4">
              <button
                onClick={() => setActiveTab("universities")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "universities"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <School className="inline-block mr-2 h-5 w-5" />
                Universities
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "products"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Package className="inline-block mr-2 h-5 w-5" />
                Products
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "users"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Users className="inline-block mr-2 h-5 w-5" />
                Users
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "admins"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Shield className="inline-block mr-2 h-5 w-5" />
                Admins
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Universities Tab */}
        {activeTab === "universities" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Universities
              </h2>
              <button
                onClick={() => {
                  setIsAddingUniversity(true);
                  setEditingUniversity(null);
                  setFormData({ name: "", domain: "", location: "" });
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <PlusCircle className="h-5 w-5" />
                Add University
              </button>
            </div>

            {isAddingUniversity && (
              <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">
                  {editingUniversity ? "Edit University" : "Add New University"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) =>
                        setFormData({ ...formData, domain: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingUniversity(false);
                        setEditingUniversity(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {universities.map((university) => (
                    <tr key={university.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {university.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {university.domain}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {university.location || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleEdit(university)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(university.id)}
                          className="text-red-600 hover:text-red-900"
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
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Manage Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
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
                                ((prev[product.id] || 0) -
                                  1 +
                                  product.imageUrls.length) %
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
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.condition === "NEW"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.condition}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{product.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-700">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span>
                          {product.monthsOld}{" "}
                          {product.monthsOld === 1 ? "month" : "months"} old
                        </span>
                      </div>
                      {product.location && (
                        <div className="flex items-center text-sm">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{product.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
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
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Manage Users
            </h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Verification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined{" "}
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.universityName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.email_verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.email_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleToggleAdmin(user.id, false)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Make Admin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === "admins" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Manage Administrators
            </h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                            <div className="text-sm font-medium text-gray-900">
                              {admin.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Admin since{" "}
                              {new Date(admin.admin_since).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {admin.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {universities.find((u) => u.id === admin.university_id)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleToggleAdmin(admin.id, true)}
                          className="text-red-600 hover:text-red-900"
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
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
