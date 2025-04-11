import React, { useState, useEffect } from "react";
import ProductCard from "./product/ProductCard";
const Home = ({ searchQuery, sortField, sortDir, selectedUniversity }) => {
  console.log("Home received sort props:", { sortField, sortDir, selectedUniversity });
  return (
    <div>
      <div className="bg-background">
              <main className="container mx-auto py-4">
          <ProductCard searchQuery={searchQuery} sortField={sortField} sortDir={sortDir} selectedUniversity={selectedUniversity} />
        </main>
      </div>
    </div>
  );
};

export default Home;
