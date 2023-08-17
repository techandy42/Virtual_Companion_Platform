import React, { useState, useEffect } from 'react'
import { useSupabase } from './SupabaseContext'
import { Link } from 'react-router-dom'

interface Companion {
  id: number
  user_id: string
  name: string
  description: string
}

interface CompanionListProps {
  userId: string | null
}

export const CompanionList: React.FC<CompanionListProps> = ({ userId }) => {
  const supabase = useSupabase()
  const [companions, setCompanions] = useState<Companion[]>([])

  useEffect(() => {
    if (userId) {
      const fetchCompanions = async () => {
        const { data, error } = await supabase
          .from('companions')
          .select('*')
          .eq('user_id', userId)

        if (error) {
          console.error('Error fetching companions:', error)
        } else {
          setCompanions(data || [])
        }
      }

      fetchCompanions()
    }
  }, [userId, supabase])

  return (
    <div>
      <h1>Your Companions</h1>
      <ul>
        {companions.map((companion) => (
          <li key={companion.id}>
            <Link to={`/chat/${companion.id}`}>
              <strong>{companion.name}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
