
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Video
} from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const MyVideos = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (authLoading || !user) return

    const fetchMyVideos = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/videos/my-videos')
        setVideos(response.data.data || [])
      } catch (error) {
        console.error(
          'Fetch my videos error:',
          error.response?.data || error.message
        )

        setError(
          error.response?.data?.message || 'Failed to load your videos'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMyVideos()
  }, [authLoading, user])

  const handleTogglePublish = async (videoId) => {
    if (actionLoading) return

    try {
      setActionLoading(videoId)

      const response = await api.patch(
        `/videos/toggle/publish/${videoId}`
      )

      const updatedVideo = response.data.data

      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video._id === videoId
            ? {
                ...video,
                isPublished:
                  updatedVideo?.isPublished ?? !video.isPublished
              }
            : video
        )
      )
    } catch (error) {
      console.error(
        'Toggle publish error:',
        error.response?.data || error.message
      )

      alert(
        error.response?.data?.message || 'Failed to update publish status'
      )
    } finally {
      setActionLoading('')
    }
  }

  const handleDelete = async (videoId) => {
    if (actionLoading) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this video? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      setActionLoading(videoId)

      await api.delete(`/videos/delete/${videoId}`)

      setVideos((currentVideos) =>
        currentVideos.filter((video) => video._id !== videoId)
      )
    } catch (error) {
      console.error(
        'Delete video error:',
        error.response?.data || error.message
      )

      alert(error.response?.data?.message || 'Failed to delete video')
    } finally {
      setActionLoading('')
    }
  }

  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds)) {
      return ''
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }

  if (authLoading || loading) {
    return (
      <div className="py-10 text-center text-gray-400">
        Loading your videos...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Videos</h1>
        <p className="mt-2 text-gray-400">
          Manage the videos you've uploaded to StreamHub.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {!error && videos.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
          <Video size={48} className="mx-auto mb-4 text-gray-500" />

          <h2 className="text-xl font-semibold">
            No videos yet
          </h2>

          <p className="mt-2 text-gray-400">
            Upload your first video to see it here.
          </p>

          <button
            onClick={() => navigate('/upload')}
            className="mt-5 rounded-full bg-red-600 px-6 py-2 font-semibold hover:bg-red-700"
          >
            Upload Video
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video._id}
              className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row"
            >
              <button
                type="button"
                onClick={() => navigate(`/video/${video._id}`)}
                className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-black sm:w-56"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />

                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <Play size={36} fill="white" />
                </span>

                {video.duration != null && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </button>

              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="line-clamp-2 text-lg font-semibold">
                  {video.title}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                  {video.description || 'No description'}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {video.views || 0} views
                  </span>

                  {video.createdAt && (
                    <span>
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  )}

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      video.isPublished
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {video.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 sm:mt-auto sm:pt-4">
                  <button
                    onClick={() => navigate(`/video/${video._id}`)}
                    className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
                  >
                    <Play size={16} />
                    Watch
                  </button>

                  <button
                    onClick={() => navigate(`/edit-video/${video._id}`)}
                    className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleTogglePublish(video._id)}
                    disabled={Boolean(actionLoading)}
                    className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700 disabled:opacity-50"
                  >
                    {video.isPublished ? (
                      <>
                        <EyeOff size={16} />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(video._id)}
                    disabled={Boolean(actionLoading)}
                    className="flex items-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm text-red-400 hover:bg-red-600/20 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                  {actionLoading === video._id && (
                    <span className="self-center text-sm text-gray-400">
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyVideos
