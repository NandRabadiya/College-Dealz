import React, { useState, useEffect } from "react";
import ProductCard from "./product/ProductCard";
import NavBar from "./navbar/NavBar";
import WantlistTour from "./wantlist/WantlistTour";
const Home = ({ searchQuery, sortField, sortDir, selectedUniversity }) => {
  console.log("Home received sort props:", { sortField, sortDir, selectedUniversity });

  // State to track whether the tour should run
  const [showTour, setShowTour] = useState(true);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenWantlistTour");

    if (!hasSeenTour) {
      setShowTour(true); // Show the tour if the user hasn't seen it before
     // localStorage.setItem("hasSeenWantlistTour", "true"); // Mark it as shown
      console.log("Home useEffect: Showing tour", { hasSeenTour });
    }
  }, []);

  return (
    <div>
      <div className="bg-background">
        {showTour && <WantlistTour />} {/* Show tour only if applicable */}
        <main className="container mx-auto py-4">
          <ProductCard searchQuery={searchQuery} sortField={sortField} sortDir={sortDir} selectedUniversity={selectedUniversity} />
        </main>
      </div>
    </div>
  );
};

export default Home;
