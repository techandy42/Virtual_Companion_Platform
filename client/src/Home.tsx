import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CompanionList } from './CompanionList'
import { Navbar } from './Navbar' // Import Navbar component
import './home.css'

interface HomeProps {
  userId: string | null
  signOut: () => Promise<void>
}

export const Home: React.FC<HomeProps> = ({ userId, signOut }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className='flex flex-col h-screen city-background'>
      {/* Navbar component */}
      <Navbar toggleSidebar={toggleSidebar} signOut={signOut} />

      {/* Sidebar */}
      <CompanionList userId={userId} isOpen={isSidebarOpen} />

      {/* Main content */}
      <div className='flex items-center justify-center flex-grow'>
        <Link
          to='/create'
          className='bg-blue-500 hover:bg-blue-700 text-white font-semibold text-lg py-4 px-8 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          Create Companion
        </Link>
      </div>
    </div>
  )
}
