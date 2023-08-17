import React from 'react'
import { Link } from 'react-router-dom'
import { CompanionList } from './CompanionList'

interface HomeProps {
  userId: string | null
  signOut: () => Promise<void>
}

export const Home: React.FC<HomeProps> = ({ userId, signOut }) => {
  return (
    <div>
      <h1>Logged in!</h1>
      <button onClick={() => signOut()}>Sign Out</button>
      <Link to='/create'>Create Companion</Link>
      <CompanionList userId={userId} />
    </div>
  )
}
