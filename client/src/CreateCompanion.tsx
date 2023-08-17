import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from './SupabaseContext'

interface CreateCompanionProps {
  userId: string | null
}

export const CreateCompanion: React.FC<CreateCompanionProps> = ({ userId }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imagePath, setImagePath] = useState<string | null>(null)
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
          image_path: imagePath,
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
    if (name && description) {
      // Request the image from the backend
      const imageResponse = await fetch('http://127.0.0.1:5000/create-image', {
        // Updated URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const imageData = await imageResponse.json()
      setImagePath(imageData.path)
    } else {
      alert(
        'Please fill out both the name and description fields before requesting an image.',
      )
    }
  }

  return (
    <div>
      <h1>Create Companion Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='name'>Name:</label>
          <input
            type='text'
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor='description'>Description:</label>
          <textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type='submit' disabled={!name || !description || !imagePath}>
          Submit
        </button>
      </form>
      <button onClick={requestImage} disabled={!name || !description}>
        Request Image
      </button>
      {imagePath && <img src={imagePath} alt={`Image of ${name}`} />}
    </div>
  )
}
