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

// PrivateRoute component
const PrivateRoute = ({ element, isLoggedIn, redirectTo }) => {
  return isLoggedIn ? element : <Navigate to={redirectTo} />;
};

function App() {
  // Simulating user authentication status (replace with actual logic, e.g., context or Redux)
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <>
    <Router>
    <NavBar/>

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Login/Register Route */}
        <Route path="/Authenticate" element={<Authenticate isOpen={true} />} />

        {/* Protected Route */}
        <Route
          path="/dashboard" 
          element={
            <PrivateRoute
              isLoggedIn={isLoggedIn}
              redirectTo="/Authenticate"
              element={<Dashboard />}
            />
          }
        />
        <Route
          path="/post-a-deal"
          element={
            <PrivateRoute
              element={<PostADeal />} // Use PascalCase for the component
              isLoggedIn={isLoggedIn}
              redirectTo="/authenticate"
            />
          }
        />
      </Routes>
    </Router>
    </>
  );
}

export default App;
