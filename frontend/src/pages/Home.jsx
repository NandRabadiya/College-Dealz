import React from 'react'
import ProductCard from './product/ProductCard'
import NavBar from './NavBar'
import ProductDetails from './product/ProductDetails'
import Profile from './dasboard/Profile'
import Authenticate from './authentication/Authenticate'

const Home = () => {
  return (
    <div>
      <div className="bg-background">
          <NavBar/>
          <main className="container mx-auto py-4">
            <ProductCard/>
            {/* <Profile/> */}
          {/* <ProductDetails/> */}
          </main>
          </div>
    </div>
  )
}

export default Home;