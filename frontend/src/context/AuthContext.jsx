
import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/users/current-user')
        setUser(response.data.data)
      } catch (error) {
        setUser(null)
        console.log('No authenticated user found')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  const login = async (credentials) => {
    const response = await api.post('/users/login', credentials)

    // We'll verify the exact response shape next if needed.
    const loggedInUser =
      response.data.data?.user || response.data.data

    setUser(loggedInUser)

    return response
  }

  const logout = async () => {
    try {
      await api.post('/users/logout')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
