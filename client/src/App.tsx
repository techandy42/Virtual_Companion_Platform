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

const supabase = createClient(
  'https://cnyhjkbcgesrzdmmwxey.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueWhqa2JjZ2VzcnpkbW13eGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIxNjk1NjQsImV4cCI6MjAwNzc0NTU2NH0.MHuIeCtCDwx0HbCTr80H31QOyQYdGS1khX5fc1Mc0d0',
)

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
