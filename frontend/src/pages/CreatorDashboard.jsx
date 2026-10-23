
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Eye,
  Users,
  Play,
  ArrowRight,
  BarChart3,
  ThumbsUp
} from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const CreatorDashboard = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [videos, setVideos] = useState([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (authLoading || !user) return

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError('')

        if (!user.username) {
          throw new Error('Your account username is unavailable.')
        }

        const [videosResponse, channelResponse] = await Promise.all([
          api.get('/videos/my-videos'),
          api.get(`/users/c/${user.username}`)
        ])

        const myVideos = Array.isArray(videosResponse.data.data)
          ? videosResponse.data.data
          : []

        setVideos(myVideos)
        setSubscriberCount(
          channelResponse.data.data?.subscribersCount || 0
        )

        // Fetch like counts for all uploaded videos
        const likesResponses = await Promise.all(
          myVideos.map((video) =>
            api.get(`/videos/likes/${video._id}`)
          )
        )

        const likes = likesResponses.reduce((total, response) => {
          const data = response.data.data

          const count =
            typeof data === 'number'
              ? data
              : data?.likesCount ??
                data?.totalLikes ??
                data?.count

          if (typeof count === 'number') {
            return total + count
          }

          if (Array.isArray(data)) {
            return total + data.length
          }

          return total
        }, 0)

        setTotalLikes(likes)
      } catch (error) {
        console.error(
          'Dashboard fetch error:',
          error.response?.data || error.message
        )

        setError(
          error.response?.data?.message ||
          error.message ||
          'Failed to load dashboard'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [authLoading, user])

  const totalViews = videos.reduce(
    (total, video) => total + (Number(video.views) || 0),
    0
  )

  const stats = [
    {
      label: 'Total Videos',
      value: videos.length.toLocaleString(),
      icon: Video,
      description: 'Videos uploaded'
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      description: 'Across your videos'
    },
    {
      label: 'Total Likes',
      value: totalLikes.toLocaleString(),
      icon: ThumbsUp,
      description: 'Likes across your videos'
    },
    {
      label: 'Subscribers',
      value: subscriberCount.toLocaleString(),
      icon: Users,
      description: 'Channel subscribers'
    }
  ]

  if (authLoading || loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        Loading creator dashboard...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-7xl text-white">
      {/* Dashboard header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm text-red-400">
            <BarChart3 size={18} />
            CREATOR STUDIO
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Welcome back, {user.fullName || user.username}!
          </h1>

          <p className="mt-2 text-gray-400">
            Here's how your channel is doing.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="rounded-full bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
        >
          + Upload Video
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {!error && (
        <>
          {/* Statistics cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">{stat.label}</p>

                    <div className="rounded-xl bg-red-500/10 p-3">
                      <Icon size={22} className="text-red-400" />
                    </div>
                  </div>

                  <p className="mt-5 text-3xl font-bold">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {stat.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Recent videos */}
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Your Videos</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Your latest uploads and their performance.
                </p>
              </div>

              <button
                onClick={() => navigate('/my-videos')}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
              >
                Manage all
                <ArrowRight size={16} />
              </button>
            </div>

            {videos.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
                <Video
                  size={40}
                  className="mx-auto mb-4 text-gray-500"
                />

                <h3 className="text-lg font-semibold">
                  No videos uploaded yet
                </h3>

                <p className="mt-2 text-gray-400">
                  Upload your first video to get started.
                </p>

                <button
                  onClick={() => navigate('/upload')}
                  className="mt-5 rounded-full bg-red-600 px-5 py-2 font-semibold hover:bg-red-700"
                >
                  Upload your first video
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
                {videos.slice(0, 5).map((video, index) => (
                  <div
                    key={video._id}
                    className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${
                      index !== 0 ? 'border-t border-gray-800' : ''
                    }`}
                  >
                    <button
                      onClick={() => navigate(`/video/${video._id}`)}
                      className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-black sm:w-40"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={28} fill="white" />
                      </span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-semibold">
                        {video.title}
                      </h3>

                      <p className="mt-2 text-sm text-gray-400">
                        {Number(video.views || 0).toLocaleString()} views
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs ${
                          video.isPublished
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {video.isPublished ? 'Published' : 'Unpublished'}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/edit-video/${video._id}`)}
                      className="rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Edit video
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CreatorDashboard
