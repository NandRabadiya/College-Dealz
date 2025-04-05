import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import UserDeals from "./UserDeals";
import { logout } from ".././../redux/Auth/actions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import AdminDashboard from "../admin/AdminDashboard";
import axios from "axios";
import { API_BASE_URL } from "../Api/api"; // Adjust the import path as necessary
const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [localUser, setLocalUser] = useState({
    profilePicture: "account.png",
    name: "Guest",
    email: "guest@example.com",
    university: "N/A",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(localUser.name);
  const [editedImage, setEditedImage] = useState(null);
  const [isAdminView, setIsAdminView] = useState(() => {
    const saved = localStorage.getItem("isAdminView");
    return saved === "true"; // convert string to boolean
  });
  useEffect(() => {
    localStorage.setItem("isAdminView", isAdminView);
  }, [isAdminView]);
  
    const [isAdmin, setIsAdmin] = useState(false);

  const [deals, setDeals] = useState([]); // Replace with fetched data if applicable
  const [isEditingDeal, setIsEditingDeal] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);

  useEffect(() => {
    console.log("Dashboard - User from Redux:", user);
    console.log("Dashboard - isAuthenticated:", isAuthenticated);
  }, [user, isAuthenticated]);
  // Populate local state with Redux user data
  useEffect(() => {
    if (user) {
      setLocalUser({
        profilePicture: user.profilePicture || "account.png",
        name: user.username, 
        email: user.email,
        university: user.universityName || "N/A", 
      });
  
      setIsAdmin(user.roles?.includes("ADMIN"));
      
      console.log("User roles:", user.roles); 
    }
  }, [user]);
  
  // Format price to currency (example for future deal use)
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  // Handle profile update
  const handleProfileUpdate = async () => {
    const authToken = localStorage.getItem("jwt");
    if (!authToken) {
        console.error("No auth token found");
        return; 
    }
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/dashboard/update`, // ✅ Send user's ID in the URL
            {
                username: editedName, // ✅ Use correct key from API response
                profilePicture: editedImage || localUser.profilePicture,
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }, // ✅ Pass token in headers
            }
        );

        setLocalUser(response.data); // ✅ Update state with new user data
        setIsEditingProfile(false);
        console.log("Profile updated successfully:", response.data);
    } catch (error) {
        console.error("Error updating profile:", error);
    }
};


  // Handle image change for profile
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <Card className="shadow-lg rounded-xl bg-background">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                    <img
                      src={localUser.profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -bottom-2 -right-2 bg-background shadow-lg rounded-full"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    {localUser.name}
                  </h2>
                  <p className="text-sm text-gray-500">{localUser.email}</p>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-600"
                  >
                    {typeof localUser.university === "object"
                      ? localUser.university.name
                      : localUser.university}
                  </Badge>
                      {console.log("isAdmin", isAdmin)}
                  {isAdmin ? (
                  // {true ? (
                    <div className="flex items-center justify-center space-x-2 mt-4">
                      <span className="text-sm">User</span>
                      <Switch
                        checked={isAdminView}
                        onCheckedChange={setIsAdminView}
                      />
                      <span className="text-sm">Admin</span>
                    </div>
                  ) : null}
                  <Button className="w-full mt-4" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            {/* <UserDeals /> */}
            <div className="md:col-span-2">
              {isAdminView ? <AdminDashboard /> : <UserDeals />}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-lg bg-background rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Profile Picture
              </label>
              <Input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Name
              </label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="border-gray-300 focus:ring-primary focus:border-primary"
              />
            </div>
            <Button
              onClick={handleProfileUpdate}
              className="w-full bg-primary text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
