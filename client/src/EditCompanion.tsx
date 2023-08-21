import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSupabase } from './SupabaseContext'
import { NavbarNonHome } from './NavbarNonHome'

interface EditCompanionProps {
  userId: string | null
  signOut: () => Promise<void>
}

export const EditCompanion: React.FC<EditCompanionProps> = ({
  userId,
  signOut,
}) => {
  const { companionId } = useParams<{ companionId: string }>()
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useSupabase()
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) return

    const fetchCompanion = async () => {
      const { data, error } = await supabase
        .from('companions')
        .select('name, description, image_base64')
        .eq('id', companionId)
        .single()

      if (error) {
        console.error('Error fetching companion:', error)
      } else if (data) {
        setName(data.name)
        setDescription(data.description)
        setImageBase64(data.image_base64) // Set the current image
      }
    }

    fetchCompanion()
  }, [userId, companionId, supabase])

  const requestImage = async () => {
    setIsLoading(true)
    if (name && description) {
      // Request the image from the backend
      const imageResponse = await fetch(
        `${import.meta.env.VITE_REACT_APP_SERVER_URL}/create-image`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        },
      )
      const imageData = await imageResponse.json()
      setImageBase64(imageData.base64)
    } else {
      alert(
        'Please fill out both the name and description fields before requesting an image.',
      )
    }
    setIsLoading(false)
  }

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('companions')
      .update({ name, description, image_base64: imageBase64 })
      .eq('id', companionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating companion:', error)
    } else {
      alert('Companion updated successfully!')
      navigate('/home')
    }
  }

  const handleDelete = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to delete this companion?',
    )
    if (confirmation) {
      const { error } = await supabase
        .from('companions')
        .delete()
        .eq('id', companionId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting companion:', error)
      } else {
        alert('Companion deleted successfully!')
        navigate('/home')
      }
    }
  }

  return (
    <div className='flex flex-col h-screen bg-gray-100'>
      <NavbarNonHome signOut={signOut} />
      <div className='p-8'>
        <h1 className='text-2xl font-semibold mb-4'>Edit Companion</h1>
        <div className='bg-white p-8 rounded-md shadow-md'>
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
          <div className='mt-4 flex space-x-4'>
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
            <button
              onClick={handleUpdate}
              className={`bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${
                !name || !description || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Update
            </button>
            <button
              onClick={handleDelete}
              className={`bg-red-600 text-white p-2 rounded-md hover:bg-red-700 ${
                !name || !description || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
