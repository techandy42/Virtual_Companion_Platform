import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'
import { Home } from './Home.tsx'
import { CreateCompanion } from './CreateCompanion.tsx'
import { CompanionChat } from './CompanionChat.tsx'
import { EditCompanion } from './EditCompanion.tsx' // Import the new component
import { SupabaseContext } from './SupabaseContext' // Import the context
import { Login } from './Login.jsx'

const supabase_url: string = import.meta.env.VITE_REACT_APP_SUPABASE_URL || ''
const supabase_anon_key: string =
  import.meta.env.VITE_REACT_APP_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabase_url, supabase_anon_key)

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    console.log(error)
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      <Router>
        <Routes>
          <Route
            path='/chat/:companionId'
            element={
              <CompanionChat userId={session?.user?.id} signOut={signOut} />
            }
          />
          <Route
            path='/edit/:companionId'
            element={
              session ? (
                <EditCompanion userId={session?.user?.id} signOut={signOut} />
              ) : (
                <Navigate to='/' />
              )
            }
          />
          <Route
            path='/home'
            element={
              session ? (
                <Home userId={session?.user?.id} signOut={signOut} />
              ) : (
                <Navigate to='/' />
              )
            }
          />
          <Route
            path='/create'
            element={
              session ? (
                <CreateCompanion userId={session?.user?.id} signOut={signOut} />
              ) : (
                <Navigate to='/' />
              )
            }
          />
          <Route
            path='/'
            element={!session ? <Login supabase={supabase} /> : <Navigate to='/home' />}
          />
        </Routes>
      </Router>
    </SupabaseContext.Provider>
  )
}
