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
import ChatList from "./pages/chat/ChatList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WishList from "./pages/wishlist/WishList";
import Wantlist from "./pages/wantlist/Wantlist";

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

  return (
    <>
      <Router>
        <NavBar />

        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatList />} />
          {/* Login/Register Route */}
          <Route
            path="/Authenticate"
            element={<Authenticate isOpen={true} />}
          />
          <Route path="/admin" element={<AdminDashboard />} />

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
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
