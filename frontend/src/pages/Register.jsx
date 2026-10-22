
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, User, ImagePlus } from 'lucide-react'
import api from '../api/axios'

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  })

  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
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

    if (!avatar) {
      setError('Please select an avatar image')
      return
    }

    try {
      setLoading(true)

      const data = new FormData()
      data.append('fullName', formData.fullName)
      data.append('username', formData.username)
      data.append('email', formData.email)
      data.append('password', formData.password)
      data.append('avatar', avatar)

      if (coverImage) {
        data.append('coverImage', coverImage)
      }

      const response = await api.post('/users/register', data)

      console.log('Registration successful:', response.data)
      navigate('/login')
    } catch (error) {
      setError(
        error.response?.data?.message || 'Registration failed'
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
          Create your account
        </h1>

        <p className="mt-2 text-center text-sm text-gray-400">
          Join StreamHub and start watching
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Full name
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Username
            </label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email address
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
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
              minLength={8}
              placeholder="Create a password"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-gray-300">
              <User size={16} />
              Avatar image (required)
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(event) => setAvatar(event.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-700 file:px-3 file:py-2 file:text-white"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-gray-300">
              <ImagePlus size={16} />
              Cover image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCoverImage(event.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-700 file:px-3 file:py-2 file:text-white"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-red-500 hover:text-red-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
