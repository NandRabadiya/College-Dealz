
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "../Api/api";
import { Toaster } from "@/components/ui/toaster";

// Import components
import DashboardHeader from "./DashboardHeader";
import UniversitiesTab from "./UniversitiesTab";
import ArchivedProductsTab from "./ArchivedProductsTab";
import ProductsTab from "./ProductsTab";
import UsersTab from "./UsersTab";
import AdminsTab from "./AdminsTab";
import FeedbackTab from "./FeedbackTab";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archivedProducts, setArchivedProducts] = useState([]);

  // Fetch data
  useEffect(() => {
    fetchUniversities();
    fetchProducts();
    fetchUsers();
    fetchAdmins();
    fetchFeedback();
    fetchArchivedProducts();
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
      toast({
        title: "Error",
        description: "Failed to load feedback data",
        variant: "destructive",
      });
    }
  };

  const fetchArchivedProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/archived-products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      setArchivedProducts(response.data);
    } catch (error) {
      console.error("Error fetching archived products:", error);
      toast({
        title: "Error",
        description: "Failed to load archived products",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteArchivedProduct = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this archived product?"
      )
    ) {
      try {
        await axios.delete(`${API_BASE_URL}/api/archived-products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
        fetchArchivedProducts();
        toast({
          title: "Success",
          description: "Product permanently deleted",
        });
      } catch (error) {
        console.error("Error deleting archived product:", error);
        toast({
          title: "Error",
          description: "Failed to delete archived product",
          variant: "destructive",
        });
      }
    }
  };
  
  // Report handlers
  const handleReportUser = async (userId, reason) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_BASE_URL}/api/reports/user/${userId}`,
        { message: reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      toast({
        title: "Warning Sent",
        description: "User has been warned successfully",
      });
    } catch (error) {
      console.error("Error warning user:", error);
      toast({
        title: "Warning Failed",
        description: "Failed to send warning to user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportProduct = async (productId, reason) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_BASE_URL}/api/reports/product/${productId}`,
        { message: reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      toast({
        title: "Warning Sent",
        description: "Product warning sent successfully",
      });
    } catch (error) {
      console.error("Error warning product:", error);
      toast({
        title: "Warning Failed",
        description: "Failed to send product warning",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch functions with proper error handling
  const fetchUniversities = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/universities/public`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      setUniversities(response.data);
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast({
        title: "Error",
        description: "Failed to load community data",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Community updated successfully",
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/universities`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
        toast({
          title: "Success",
          description: "Community added successfully",
        });
      }
      fetchUniversities();
      setIsAddingUniversity(false);
      setEditingUniversity(null);
      setFormData({ name: "", domain: "", location: "" });
    } catch (error) {
      console.error("Error saving community:", error);
      toast({
        title: "Error",
        description: "Failed to save C=community data",
        variant: "destructive",
      });
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
    if (!window.confirm("Are you sure you want to delete this community?")) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/universities/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      fetchUniversities();
      toast({
        title: "Success",
        description: "Community deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting community:", error);
      toast({
        title: "Error",
        description: "Failed to delete community",
        variant: "destructive",
      });
    }
  };

  // Admin management handlers
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
          fetchAdmins();
          toast({
            title: "Success",
            description: "User has been made an admin",
          });
        } else {
          await axios.delete(
            `${API_BASE_URL}/api/admin_only/remove/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
          );
          fetchAdmins();
          toast({
            title: "Success",
            description: "Admin privileges removed",
          });
        }
        await Promise.all([fetchUsers(), fetchAdmins()]);
      } catch (error) {
        console.error("Error toggling admin status:", error);
        toast({
          title: "Error",
          description: "Failed to update admin status",
          variant: "destructive",
        });
      }
    }
  };

  // Handle feedback deletion
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/feedback/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      
      setFeedback(feedback.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Universities Tab */}
        {activeTab === "universities" && (
          <UniversitiesTab
            universities={universities}
            isAddingUniversity={isAddingUniversity}
            setIsAddingUniversity={setIsAddingUniversity}
            editingUniversity={editingUniversity}
            setEditingUniversity={setEditingUniversity}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}

        {/* Archived Products Tab */}
        {activeTab === "archivedProducts" && (
          <ArchivedProductsTab
            archivedProducts={archivedProducts}
            handleDeleteArchivedProduct={handleDeleteArchivedProduct}
          />
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <ProductsTab
            products={products}
            currentImageIndexes={currentImageIndexes}
            setCurrentImageIndexes={setCurrentImageIndexes}
            handleReportProduct={handleReportProduct}
          />
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <UsersTab
            users={users}
            handleToggleAdmin={handleToggleAdmin}
            handleReportUser={handleReportUser}
          />
        )}

        {/* Admins Tab */}
        {activeTab === "admins" && (
          <AdminsTab
            admins={admins}
            universities={universities}
            handleToggleAdmin={handleToggleAdmin}
          />
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <FeedbackTab
            feedback={feedback}
            handleDeleteFeedback={handleDeleteFeedback}
          />
        )}
      </main>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default AdminDashboard;