
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Play,
  Video,
  Bell,
  UserCircle,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message)
      alert('Logout failed. Please try again.')
    }
  }

  const handleSearch = (event) => {
    event.preventDefault()

    if (!searchQuery.trim()) return

    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex shrink-0 items-center gap-4">
          <button
            aria-label="Menu"
            className="rounded-full p-2 text-gray-300 hover:bg-gray-800"
          >
            <Menu size={23} />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
              <Play size={20} fill="white" className="text-white" />
            </div>

            <span className="text-xl font-bold text-white">
              Stream<span className="text-red-500">Hub</span>
            </span>
          </Link>
        </div>

        {/* Search section */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-xl flex-1 sm:flex"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search videos"
            className="min-w-0 flex-1 rounded-l-full border border-gray-700 bg-gray-900 px-5 py-2 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <button
            type="submit"
            aria-label="Search videos"
            className="rounded-r-full border border-l-0 border-gray-700 bg-gray-800 px-5 text-gray-300 hover:bg-gray-700"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2">
          {user && (
            <>
              <button
                aria-label="Create video"
                title="Create video"
                onClick={() => navigate('/upload')}
                className="rounded-full p-2 text-gray-300 hover:bg-gray-800"
              >
                <Video size={22} />
              </button>

              <button
                aria-label="Notifications"
                title="Notifications"
                className="hidden rounded-full p-2 text-gray-300 hover:bg-gray-800 sm:block"
              >
                <Bell size={22} />
              </button>
            </>
          )}

          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border border-gray-700 object-cover"
                  />
                ) : (
                  <UserCircle size={32} className="text-gray-300" />
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  <LogOut size={17} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="rounded-full border border-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Register
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="mt-3 flex sm:hidden">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search videos"
          className="min-w-0 flex-1 rounded-l-full border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          aria-label="Search videos"
          className="rounded-r-full bg-gray-800 px-4 text-gray-300"
        >
          <Search size={19} />
        </button>
      </form>
    </header>
  )
}

export default Navbar
