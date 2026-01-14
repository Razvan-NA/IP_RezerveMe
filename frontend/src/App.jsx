import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

const API_BASE_URL = 'http://localhost:8080/api'

// Helper function to format date in ISO 8601 format (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [spaces, setSpaces] = useState([])
  const [reservations, setReservations] = useState([])
  const [loadingSpaces, setLoadingSpaces] = useState(false)
  const [loadingReservations, setLoadingReservations] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [spaceName, setSpaceName] = useState('')
  const [spaceCapacity, setSpaceCapacity] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      checkAdminStatus()
      fetchSpaces()
      fetchReservations()
    } else {
      setIsAdmin(false)
    }
  }, [user])

  const checkAdminStatus = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        return
      }

      setIsAdmin(data !== null)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  const fetchSpaces = async () => {
    setLoadingSpaces(true)
    try {
      const response = await fetch(`${API_BASE_URL}/spaces`)
      if (response.ok) {
        const data = await response.json()
        setSpaces(data)
      } else {
        alert('Error fetching spaces')
      }
    } catch (error) {
      alert('Error fetching spaces: ' + error.message)
    } finally {
      setLoadingSpaces(false)
    }
  }

  const fetchReservations = async () => {
    if (!user?.email) return
    
    setLoadingReservations(true)
    try {
      const response = await fetch(`${API_BASE_URL}/reservations?userEmail=${encodeURIComponent(user.email)}`)
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      } else {
        alert('Error fetching reservations')
      }
    } catch (error) {
      alert('Error fetching reservations: ' + error.message)
    } finally {
      setLoadingReservations(false)
    }
  }

  const handleReserve = async (spaceId) => {
    if (!user?.email) return

    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: spaceId,
          userEmail: user.email,
          reservationDate: selectedDate,
        }),
      })

      if (response.ok) {
        // Refresh reservations list after successful reservation
        fetchReservations()
        alert('Reservation created successfully!')
      } else {
        const errorText = await response.text()
        alert('Error creating reservation: ' + errorText)
      }
    } catch (error) {
      alert('Error creating reservation: ' + error.message)
    }
  }

  const handleAddSpace = async (e) => {
    e.preventDefault()
    
    if (!spaceName || !spaceCapacity) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/spaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: spaceName,
          capacity: parseInt(spaceCapacity),
        }),
      })

      if (response.ok) {
        // Refresh spaces list after successful creation
        fetchSpaces()
        setSpaceName('')
        setSpaceCapacity('')
        alert('Space added successfully!')
      } else {
        const errorText = await response.text()
        alert('Error adding space: ' + errorText)
      }
    } catch (error) {
      alert('Error adding space: ' + error.message)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      setUser(data.user)
    } catch (error) {
      alert('Error logging in: ' + error.message)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      if (data.user) {
        alert('Sign up successful! Please check your email to verify your account.')
      }
    } catch (error) {
      alert('Error signing up: ' + error.message)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSpaces([])
      setReservations([])
      setIsAdmin(false)
    } catch (error) {
      alert('Error logging out: ' + error.message)
    }
  }

  if (loading) {
    return <div className="App">Loading...</div>
  }

  if (!user) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>RezerveMe</h1>
          <form onSubmit={handleLogin}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <button type="submit">Login</button>
              <button type="button" onClick={handleSignUp}>
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <div className="dashboard-container">
        <div className="header">
          <h1>RezerveMe Dashboard</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="dashboard">
          <p>Welcome, {user.email}!</p>
          
          {isAdmin && (
            <div className="section admin-section">
              <h2>Add Space (Admin)</h2>
              <form onSubmit={handleAddSpace} className="add-space-form">
                <div>
                  <input
                    type="text"
                    placeholder="Space Name"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Capacity"
                    value={spaceCapacity}
                    onChange={(e) => setSpaceCapacity(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <button type="submit">Add Space</button>
                </div>
              </form>
            </div>
          )}
          
          <div className="section">
            <h2>Available Spaces</h2>
            <div className="date-selector">
              <label htmlFor="reservation-date">Select Date: </label>
              <input
                id="reservation-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
            {loadingSpaces ? (
              <p>Loading spaces...</p>
            ) : spaces.length === 0 ? (
              <p>No spaces available.</p>
            ) : (
              <ul className="spaces-list">
                {spaces.map((space) => (
                  <li key={space.id} className="space-item">
                    <div className="space-info">
                      <strong>{space.name}</strong>
                      <span>Capacity: {space.capacity}</span>
                    </div>
                    <button onClick={() => handleReserve(space.id)}>
                      Reserve
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="section">
            <h2>My Reservations</h2>
            {loadingReservations ? (
              <p>Loading reservations...</p>
            ) : reservations.length === 0 ? (
              <p>You have no reservations.</p>
            ) : (
              <ul className="reservations-list">
                {reservations.map((reservation) => {
                  const space = spaces.find(s => s.id === reservation.spaceId)
                  const reservationDate = formatDate(reservation.reservationDate)
                  return (
                    <li key={reservation.id} className="reservation-item">
                      <div>
                        <strong>Space:</strong> {space ? space.name : `ID: ${reservation.spaceId}`}
                      </div>
                      <div>
                        <strong>Date:</strong> {reservationDate}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
