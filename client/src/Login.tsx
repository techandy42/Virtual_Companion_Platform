import { SupabaseClient } from '@supabase/supabase-js'
import React from 'react'
import googleLogo from './assets/google-logo.png' // Import Google logo image
import './login.css'

interface LoginProps {
  supabase: SupabaseClient
}

export const Login: React.FC<LoginProps> = ({ supabase }) => {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) console.error('Google Sign In Error:', error.message)
  }

  return (
    <div className='flex items-center justify-center h-screen bg-cover bg-center city-background'>
      <div className='max-w-screen-sm w-full mx-auto p-4 sm:px-4'>
        <div className='bg-white p-8 rounded-md shadow-md flex flex-col justify-center'>
          <h1 className='text-2xl font-semibold mb-4'>
            Welcome to the Virtual Companion Platform
          </h1>
          <p className='mb-4'>Please sign in to continue.</p>
          <button
            onClick={handleGoogleSignIn}
            className='google-signin-button flex items-center justify-center'
          >
            <img src={googleLogo} alt='Google Logo' className='google-logo' />
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  )
}
