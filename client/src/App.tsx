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
              <div>
                <h1>Logged in!</h1>
                <button onClick={() => signOut()}>Sign Out</button>
              </div>
            ) : (
              <Navigate to='/' />
            )
          }
        />
      </Routes>
    </Router>
  )
}
