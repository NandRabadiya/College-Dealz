import React, { useState, useEffect } from "react";
import ProductCard from "./product/ProductCard";
import NavBar from "./navbar/NavBar";
import WantlistTour from "./wantlist/WantlistTour";
const Home = ({ searchQuery, sortField, sortDir, selectedUniversity }) => {
  console.log("Home received sort props:", { sortField, sortDir, selectedUniversity });

  // // State to track whether the tour should run
  // const [hasSeenTour, setHasSeenTour] = useState(false);

  // useEffect(() => {
  //   // In a real app, you would fetch this from your backend
  //   // Example:
  //   // const fetchUserPreferences = async () => {
  //   //   const response = await api.getUserPreferences();
  //   //   setHasSeenTour(response.data.hasSeenTour);
  //   // };
  //   // 
  //   // fetchUserPreferences();
    
  //   // For testing, we'll use the hardcoded value
  //   console.log('User has seen tour:', hasSeenTour);
  // }, []);

  return (
    <div>
      <div className="bg-background">
      {/* <WantlistTour hasSeenTour={hasSeenTour} /> */}
              <main className="container mx-auto py-4">
          <ProductCard searchQuery={searchQuery} sortField={sortField} sortDir={sortDir} selectedUniversity={selectedUniversity} />
        </main>
      </div>
    </div>
  );
};

export default Home;
