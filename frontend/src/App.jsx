import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Authenticate from "./pages/authentication/Authenticate";
import Dashboard from "./pages/dasboard/Profile";
import ProductDetails from "./pages/product/ProductDetails";
import PostADeal from "./pages/product/PostADeal";
import NavBar from "./pages/navbar/NavBar";
import ProtectedRoute from "./Routes/ProtectedRoute";
import { useDispatch } from "react-redux";
import { getUser } from "./redux/Auth/actions";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WishList from "./pages/wishlist/WishList";
import Messages from "./pages/chat/Messages";
import WantlistPageTour from "./pages/wantlist/WantlistPageTour";
import WantlistTour from "./pages/wantlist/WantlistTour";
import Wantlist from "./pages/wantlist/Wantlist";
import UniversitySelector from "./pages/UniversitySelector";
import PublicProductDetails from "./pages/product/PublicProductDetails";
import ErrorPage from "./pages/ErrorPage";
import OAuthCallback from "./pages/authentication/OAuthCallback";


// PrivateRoute component
const PrivateRoute = ({ element, isLoggedIn, redirectTo }) => {
  return isLoggedIn ? element : <Navigate to={redirectTo} />;
};

// Tour Handler component (moved outside of App)
const AppRoutes = ({ 
  searchQuery, 
  sortField, 
  sortDir, 
  selectedUniversity, 
  hasSeenTour 
}) => {
  const location = useLocation();
  
  return (
    <>
      {/* Only render tour components on their specific routes */}
      {location.pathname === '/' && (
        <WantlistTour hasSeenTour={hasSeenTour} />
      )}
      
      {location.pathname === '/wantlist' && (
        <WantlistPageTour hasSeenTour={hasSeenTour} />
      )}
      
      {/* Main routes */}
      <Routes>
        {/* Public Route */}
        <Route
          path="/"
          element={
            <Home
              searchQuery={searchQuery}
              sortField={sortField}
              sortDir={sortDir}
              selectedUniversity={selectedUniversity}
            />
          }
        />
        <Route path="/messages" element={<Messages />} />
        {/* Login/Register Route */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route
          path="/Authenticate"
          element={<Authenticate isOpen={true} />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/product/public/:productId"
          element={<PublicProductDetails />}
        />
        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wantlist"
          element={
            <ProtectedRoute>
              <Wantlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:productId"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-a-deal"
          element={
            <ProtectedRoute>
              <PostADeal />
            </ProtectedRoute>
          }
        />
        {/* 404 Route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

function App() {
  const dispatch = useDispatch();
  
  // Tour state
  const [hasSeenTour, setHasSeenTour] = useState(false);
  
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("postDate");
  const [sortDir, setSortDir] = useState("desc");
  const [showUniversitySelector, setShowUniversitySelector] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  // Handlers
  const handleSearch = (query) => setSearchQuery(query);
  const handleSort = (field, dir) => {
    console.log("App.js sort update:", field, dir);
    setSortField(field);
    setSortDir(dir);
  };

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      dispatch(getUser(token));
    } else {
      setShowUniversitySelector(true);
    }
    console.log("App.js useEffect", { token });
  }, [dispatch]);

  // For testing tour
  useEffect(() => {
    // This would be replaced with API call in production
    // const fetchUserPreferences = async () => {
    //   try {
    //     const response = await api.getUserPreferences();
    //     setHasSeenTour(response.data.hasSeenTour);
    //   } catch (error) {
    //     console.error("Failed to fetch user preferences", error);
    //   }
    // };
    // fetchUserPreferences();
    
    // For testing - set to false to show the tour
    console.log('User has seen tour:', hasSeenTour);
  }, []);

  const handleUniversitySelect = (universityId) => {
    setSelectedUniversity(universityId);
    localStorage.setItem("selectedUniversity", universityId);
    setShowUniversitySelector(false);
  };

  return (
    <Router>
      <NavBar onSearch={handleSearch} onSort={handleSort} />
      <UniversitySelector
        isOpen={showUniversitySelector}
        onOpenChange={setShowUniversitySelector}
        onUniversitySelect={handleUniversitySelect}
      />
      <AppRoutes 
        searchQuery={searchQuery}
        sortField={sortField}
        sortDir={sortDir}
        selectedUniversity={selectedUniversity}
        hasSeenTour={hasSeenTour}
      />
    </Router>
  );
}

export default App;