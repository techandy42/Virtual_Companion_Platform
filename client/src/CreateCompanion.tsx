import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from './SupabaseContext'
import { NavbarNonHome } from './NavbarNonHome' // Import Navbar component

interface CreateCompanionProps {
  userId: string | null
  signOut: () => Promise<void>
}

export const CreateCompanion: React.FC<CreateCompanionProps> = ({
  userId,
  signOut,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useSupabase()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userId) {
      const { data, error } = await supabase.from('companions').insert([
        {
          user_id: userId,
          name: name,
          description: description,
          image_base64: imageBase64,
        },
      ])

      if (error) {
        console.error('Error inserting companion:', error)
      } else {
        console.log('Companion inserted successfully:', data)
        navigate('/home') // Navigate to the /home route
      }
    }
  }

  const requestImage = async () => {
    setIsLoading(true)
    if (name && description) {
      // Request the image from the backend
      const imageResponse = await fetch('http://127.0.0.1:8000/create-image', {
        // Updated URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const imageData = await imageResponse.json()
      setImageBase64(imageData.base64)
    } else {
      alert(
        'Please fill out both the name and description fields before requesting an image.',
      )
    }
    setIsLoading(false)
  }

  // Function to generate a realistic character
  const generateRealisticCharacter = async () => {
    setIsLoading(true)
    const response = await fetch(
      'http://127.0.0.1:8000/generate-realistic-character',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    const data = await response.json()
    setName(data.name)
    setDescription(data.description)
    setIsLoading(false)
  }

  // Function to generate a fantasy character
  const generateFantasyCharacter = async () => {
    setIsLoading(true)
    const response = await fetch(
      'http://127.0.0.1:8000/generate-fantasy-character',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    const data = await response.json()
    setName(data.name)
    setDescription(data.description)
    setIsLoading(false)
  }

  return (
    <div className='flex flex-col h-screen bg-gray-100'>
      <NavbarNonHome signOut={signOut} />
      <div className='p-8'>
        <h1 className='text-2xl font-semibold mb-4'>Create Companion Page</h1>
        <form
          onSubmit={handleSubmit}
          className='bg-white p-8 rounded-md shadow-md'
        >
          <div className='mb-4'>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-600'
            >
              Name:
            </label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={1000}
              className='mt-2 p-2 w-full rounded-md border border-gray-300'
            />
          </div>
          <div className='mb-4'>
            <div className='flex flex-col w-full'>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-600'
              >
                Description:
              </label>
              <div className='flex space-x-4 items-center'>
                <textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={10000}
                  className='mt-2 p-2 w-full h-64 resize-none rounded-md border border-gray-300 overflow-y-auto'
                />
                {imageBase64 && (
                  <img
                    src={imageBase64}
                    alt='Base64 encoded image'
                    className='mt-2 rounded-md shadow-md h-64 w-16 sm:w-48 lg:w-64'
                  />
                )}
              </div>
            </div>
          </div>
          <button
            type='submit'
            disabled={!name || !description || !imageBase64}
            className={`bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${
              !name || !description || !imageBase64
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            Submit
          </button>
        </form>
        <div className='mt-4 flex space-x-4'>
          <button
            onClick={generateRealisticCharacter}
            disabled={isLoading} // Disable the button if isLoading is true
            className={`bg-green-600 text-white p-2 rounded-md hover:bg-green-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Generate Realistic Character
          </button>
          <button
            onClick={generateFantasyCharacter}
            disabled={isLoading} // Disable the button if isLoading is true
            className={`bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Generate Fantasy Character
          </button>
          <button
            onClick={requestImage}
            disabled={!name || !description || isLoading} // Disable the button if isLoading is true
            className={`bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700 ${
              !name || !description || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            Request Image
          </button>
        </div>
      </div>
    </div>
  )
}
