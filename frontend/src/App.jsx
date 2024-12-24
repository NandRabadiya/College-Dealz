import { useState } from 'react'
import Home from './pages/Home'
import NavBar from './pages/NavBar'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavBar/>
      <Home/>
      
    </>
  )
}

export default App
