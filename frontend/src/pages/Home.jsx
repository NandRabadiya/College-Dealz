import React from 'react'
import ProductCard from './product/ProductCard'
import NavBar from './NavBar'
import ProductDetails from './product/ProductDetails'
import Profile from './dasboard/Profile'
import Authenticate from './authentication/Authenticate'

const Home = ({ searchQuery, sortField, sortDir,selectedUniversity }) => {
  console.log('Home received sort props:', { sortField, sortDir, selectedUniversity }); // Add this log
  return (
    <div>
      <div className="bg-background">
          
          <main className="container mx-auto py-4">
          <ProductCard searchQuery={searchQuery} sortField={sortField} sortDir={sortDir} selectedUniversity={selectedUniversity}/>
          </main>
          </div>
    </div>
  )
}

export default Home;