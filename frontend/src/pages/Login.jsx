
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import api from '../api/axios'

const Login = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)

      const response = await api.post('/users/login', formData)

      console.log('Login response:', response.data)

      navigate('/')
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)

      setError(
        error.response?.data?.message || 'Login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
            <Play size={22} fill="white" className="text-white" />
          </div>

          <span className="text-2xl font-bold text-white">
            Stream<span className="text-red-500">Hub</span>
          </span>
        </Link>

        <h1 className="text-center text-2xl font-bold text-white">
          Welcome back
        </h1>

        <p className="mt-2 text-center text-sm text-gray-400">
          Log in to continue watching your favorite videos
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Username
            </label>

            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>

            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-red-500 hover:text-red-400">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
