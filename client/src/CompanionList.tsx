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
  isOpen: boolean
}

export const CompanionList: React.FC<CompanionListProps> = ({
  userId,
  isOpen,
}) => {
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
    <div
      className={`md:w-64 w-48 bg-white shadow h-screen fixed pt-24 overflow-y-auto transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <ul className='space-y-2 p-4'>
        {/* Add more items as needed */}
        {companions.map((companion) => (
          <li key={companion.id}>
            <li className='p-2 hover:bg-gray-100 transition rounded'>
              <Link
                to={`/chat/${companion.id}`}
                className='text-gray-800 font-medium'
              >
                {companion.name}
              </Link>
            </li>
          </li>
        ))}
      </ul>
    </div>
  )
}
