import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSupabase } from './SupabaseContext' // Import the hook

export const CompanionChat: React.FC = () => {
  const { companionId } = useParams<{ companionId: string }>()
  const [companionName, setCompanionName] = useState<string | null>(null)
  const [companionImage, setCompanionImage] = useState<string | null>(null)
  const supabase = useSupabase() // Access the Supabase client

  useEffect(() => {
    const fetchCompanionDetails = async () => {
      const { data, error } = await supabase
        .from('companions')
        .select('name, image_path')
        .eq('id', companionId)
        .single()

      if (error) {
        console.error('Error fetching companion details:', error)
      } else if (data) {
        setCompanionName(data.name)
        setCompanionImage(data.image_path)
      }
    }

    fetchCompanionDetails()
  }, [companionId, supabase])

  return (
    <div>
      <h1>Chat with Companion</h1>
      {companionName && <p>You are chatting with {companionName}</p>}
      {companionImage && (
        <img src={companionImage} alt={`Image of ${companionName}`} />
      )}
      {/* Add your chat functionality here */}
    </div>
  )
}
