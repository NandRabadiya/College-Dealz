import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Authenticate from "./pages/Authenticate";
import Dashboard from "./pages/Profile";
import { AuthProvider } from "./pages/AuthContext";

// PrivateRoute component
const PrivateRoute = ({ element, isLoggedIn, redirectTo }) => {
  return isLoggedIn ? element : <Navigate to={redirectTo} />;
};

function App() {
  // Simulating user authentication status (replace with actual logic, e.g., context or Redux)
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <Router>
      <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />
    
        {/* Login/Register Route */}
        <Route path="/Authenticate" element={<Authenticate />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={<PrivateRoute isLoggedIn={isLoggedIn} redirectTo="/Authenticate" element={<Dashboard />} />}
        />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
