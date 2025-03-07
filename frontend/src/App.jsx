import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Authenticate from "./pages/authentication/Authenticate";
import Dashboard from "./pages/dasboard/Profile";
import ProductDetails from "./pages/product/ProductDetails";
import PostADeal from "./pages/product/PostADeal";
import NavBar from "./pages/NavBar";
import ProtectedRoute from "./Routes/ProtectedRoute";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUser } from "./redux/Auth/actions";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WishList from "./pages/wishlist/WishList";
import Wantlist from "./pages/wantlist/Wantlist";
import Messages from "./pages/chat/Messages";
import UniversitySelector from "./pages/UniversitySelector";
import PublicProductDetails from "./pages/product/PublicProductDetails";
import ErrorPage from "./pages/ErrorPage";
import OAuthCallback from "./pages/authentication/OAuthCallback";

// PrivateRoute component
const PrivateRoute = ({ element, isLoggedIn, redirectTo }) => {
  return isLoggedIn ? element : <Navigate to={redirectTo} />;
};

function App() {
  // Simulating user authentication status (replace with actual logic, e.g., context or Redux)
  // const [isLoggedIn, setIsLoggedIn] = useState(true);
  const dispatch = useDispatch();
  // In your App.jsx or main component
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      dispatch(getUser(token));
    }
  }, [dispatch]);
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("postDate");
  const [sortDir, setSortDir] = useState("desc");
  const [showUniversitySelector, setShowUniversitySelector] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  // Handlers
  const handleSearch = (query) => setSearchQuery(query);
  const handleSort = (field, dir) => {
    console.log('App.js sort update:', field, dir); // Add this log
    setSortField(field);
    setSortDir(dir);
  };
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    //const savedUniversity = localStorage.getItem("selectedUniversity");
    
    if (token) {
      dispatch(getUser(token));
    } else  {
      setShowUniversitySelector(true);
    } 
    console.log("App.js useEffect", { token });
  }, [dispatch]);

  const handleUniversitySelect = (universityId) => {
    setSelectedUniversity(universityId);
    localStorage.setItem("selectedUniversity", universityId);
    setShowUniversitySelector(false);
  };
  return (
    <>
      <Router>
      <NavBar onSearch={handleSearch} onSort={handleSort} /> {/* Pass the handlers */}
      <UniversitySelector
          isOpen={showUniversitySelector}
          onOpenChange={setShowUniversitySelector}
          onUniversitySelect={handleUniversitySelect}
        />
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
          />{" "}
          <Route path="/messages" element={<Messages />} />
          {/* Login/Register Route */}
          <Route path="/oauth-callback" element={<OAuthCallback/>} />
          <Route
            path="/Authenticate"
            element={<Authenticate isOpen={true} />}
          />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/product/public/:productId" element={<PublicProductDetails />} />
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
          {/* <Route path="*" element={<h1>404 Not Found</h1>} /> */}
          <Route path="*" element={<ErrorPage />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
