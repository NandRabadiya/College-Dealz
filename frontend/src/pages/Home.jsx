import React from 'react'
import ProductCard from './ProductCard'
import NavBar from './NavBar'

const Home = () => {
  return (
    <div>
      <div className="min-h-screen bg-background">
          <NavBar/>
          <main className="container mx-auto py-6">
          <ProductCard/>
          </main>
          </div>
    </div>
  )
}

export default Home