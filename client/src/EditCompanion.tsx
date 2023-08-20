import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSupabase } from './SupabaseContext'

interface EditCompanionProps {
  userId: string | null
}

export const EditCompanion: React.FC<EditCompanionProps> = ({ userId }) => {
  const { companionId } = useParams<{ companionId: string }>()
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
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
    if (name && description) {
      // Request the image from the backend
      const imageResponse = await fetch('http://127.0.0.1:5000/create-image', {
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
    <div>
      <h1>Edit Companion</h1>
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
      <div>
        <label htmlFor='image'>Image:</label>
        {imageBase64 && <img src={imageBase64} alt='Base64 encoded preview' />}
      </div>
      <button onClick={requestImage} disabled={!name || !description}>
        Request New Image
      </button>
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  )
}
