import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound, Video as VideoIcon, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import VideoCard from '../components/VideoCard'

const Profile = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [videos, setVideos] = useState([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?._id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const [videosResponse, channelResponse] = await Promise.all([
          api.get('/videos'),
          api.get(`/users/c/${encodeURIComponent(user.username)}`),
        ])

        const allVideos = videosResponse.data.data.videos || []

        const myVideos = allVideos.filter(
          video => String(video.owner?._id) === String(user._id)
        )

        setVideos(myVideos)
        setSubscriberCount(
          channelResponse.data.data.subscribersCount || 0
        )
      } catch (error) {
        console.error(
          'Profile fetch error:',
          error.response?.data || error.message
        )
        setError('Failed to load profile information.')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchProfileData()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return <p className="text-white">Loading profile...</p>
  }

  if (!user) {
    return (
      <div className="py-16 text-center text-white">
        <UserRound size={48} className="mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold">Login to view your profile</h2>

        <button
          onClick={() => navigate('/login')}
          className="mt-5 rounded-full bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-white">
      <div
        className="h-40 rounded-2xl bg-gradient-to-r from-red-900 via-gray-800 to-gray-950 sm:h-56"
        style={
          user.coverImage
            ? {
                backgroundImage: `url("${user.coverImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="Your avatar"
            className="h-24 w-24 rounded-full border border-gray-700 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
            <UserRound size={36} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">
            {user.fullName || user.username}
          </h1>

          <p className="mt-1 text-gray-400">@{user.username}</p>

          <p className="mt-2 text-sm text-gray-400">
            {subscriberCount} subscribers · {videos.length} videos
          </p>
        </div>

        <button
          onClick={() => navigate(`/channel/${user.username}`)}
          className="rounded-full bg-gray-800 px-5 py-3 font-semibold hover:bg-gray-700"
        >
          View channel
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="border-b border-gray-800 pb-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <VideoIcon size={21} />
          Your videos
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading your videos...</p>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map(video => (
            <VideoCard
              key={video._id}
              video={{
                ...video,
                id: video._id,
                avatar: video.owner?.avatar,
                channel: video.owner?.username || user.username,
                uploadedAt: video.createdAt
                  ? new Date(video.createdAt).toLocaleDateString()
                  : '',
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <VideoIcon size={40} className="mx-auto mb-3 text-gray-500" />
          <p className="text-gray-300">You haven't uploaded any videos yet.</p>
        </div>
      )}
    </div>
  )
}

export default Profile