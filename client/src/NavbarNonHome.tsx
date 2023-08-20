import React from 'react'
import { useNavigate } from 'react-router-dom'

interface NavbarNonHomeProps {
  signOut: () => Promise<void>
}

export const NavbarNonHome: React.FC<NavbarNonHomeProps> = ({ signOut }) => {
  const navigate = useNavigate()

  return (
    <nav className='bg-white shadow-md p-4 text-gray-800 w-full flex justify-between relative z-50'>
      <div>
        <button
          className='mx-2 px-4 py-2 bg-blue-500 text-white rounded'
          onClick={() => navigate('/home')}
        >
          Home
        </button>
        <button
          onClick={() => navigate(-1)}
          className='mx-2 text-blue-500 hover:underline'
        >
          Back
        </button>
      </div>
      <button
        onClick={() => signOut()}
        className='mx-2 px-4 py-2 bg-blue-500 text-white rounded'
      >
        Sign Out
      </button>
    </nav>
  )
}
