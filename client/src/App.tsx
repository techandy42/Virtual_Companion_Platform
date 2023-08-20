import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'
import { Home } from './Home.tsx'
import { CreateCompanion } from './CreateCompanion.tsx'
import { CompanionChat } from './CompanionChat.tsx'
import { SupabaseContext } from './SupabaseContext' // Import the context

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
            path='/'
            element={
              !session ? (
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  providers={['google']}
                />
              ) : (
                <Navigate to='/home' />
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
                <CreateCompanion userId={session?.user?.id} />
              ) : (
                <Navigate to='/' />
              )
            }
          />
          <Route
            path='/chat/:companionId'
            element={<CompanionChat userId={session?.user?.id} />}
          />
        </Routes>
      </Router>
    </SupabaseContext.Provider>
  )
}
