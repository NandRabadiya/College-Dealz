import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./pages/NavBar";
import ProductCard from "./pages/ProductCard";
import { AuthProvider } from "./pages/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <NavBar />
          {/* Main content area */}
          <main className="container mx-auto py-6">
            <Routes>
              <Route path="/" element={<ProductCard />} />
              {/* Add more routes here as needed */}
            </Routes>{" "}
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
