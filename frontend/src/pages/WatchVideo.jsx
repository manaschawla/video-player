
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ThumbsUp, Share2 } from 'lucide-react'
import api from '../api/axios'

const WatchVideo = () => {
  const { videoId } = useParams()

  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/videos/${videoId}`)
        setVideo(response.data.data)
      } catch (error) {
        console.error(
          'Fetch video error:',
          error.response?.data || error.message
        )
        setError(error.response?.data?.message || 'Failed to load video')
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await api.get(`/videos/is-liked/${videoId}`)
        const result = response.data.data

        setIsLiked(
          typeof result === 'boolean'
            ? result
            : Boolean(result?.isLiked)
        )
      } catch (error) {
        console.error(
          'Failed to fetch like status:',
          error.response?.data || error.message
        )
      }
    }

    fetchLikeStatus()
  }, [videoId])

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const channelId = video?.owner?._id

      if (!channelId) return

      try {
        const response = await api.get('/subscriptions/c')
        const subscriptions = response.data.data.channels || []

        const subscribed = subscriptions.some((item) => {
          return String(item.channel?._id) === String(channelId)
        })

        setIsSubscribed(subscribed)
      } catch (error) {
        console.error(
          'Failed to fetch subscriptions:',
          error.response?.data || error.message
        )
      }
    }

    fetchSubscriptionStatus()
  }, [video?.owner?._id])

  const handleLike = async () => {
    if (actionLoading) return

    try {
      setActionLoading(true)

      if (isLiked) {
        await api.delete(`/videos/unlike/${videoId}`)
        setIsLiked(false)
      } else {
        await api.post(`/videos/like/${videoId}`)
        setIsLiked(true)
      }
    } catch (error) {
      console.error(
        'Like action failed:',
        error.response?.data || error.message
      )
      alert(error.response?.data?.message || 'Please log in to like videos')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubscribe = async () => {
    const channelId = video?.owner?._id

    if (!channelId || actionLoading) return

    try {
      setActionLoading(true)

      if (isSubscribed) {
        await api.delete(`/subscriptions/c/${channelId}`)
        setIsSubscribed(false)
      } else {
        await api.post(`/subscriptions/c/${channelId}`)
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error(
        'Subscription action failed:',
        error.response?.data || error.message
      )
      alert(
        error.response?.data?.message || 'Unable to update subscription'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Video link copied!')
    } catch {
      alert('Could not copy the video link')
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

  if (loading) {
    return <p className="text-white">Loading video...</p>
  }

  if (error) {
    return <p className="text-red-400">{error}</p>
  }

  if (!video) {
    return <p className="text-white">Video not found</p>
  }

  return (
    <div className="max-w-6xl text-white">
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        <video
          className="h-full w-full"
          controls
          poster={video.thumbnail}
        >
          <source src={video.videoFile} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>

      <h1 className="mt-5 text-2xl font-bold">
        {video.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {video.owner?.avatar && (
            <img
              src={video.owner.avatar}
              alt="Channel avatar"
              className="h-11 w-11 rounded-full object-cover"
            />
          )}

          <div>
            <p className="font-semibold">
              {video.owner?.username || 'Unknown channel'}
            </p>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={actionLoading || !video.owner?._id}
            className={`rounded-full px-5 py-2 font-semibold transition disabled:opacity-50 ${
              isSubscribed
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {actionLoading
              ? 'Please wait...'
              : isSubscribed
                ? 'Subscribed'
                : 'Subscribe'}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLike}
            disabled={actionLoading}
            className={`flex items-center gap-2 rounded-full px-4 py-2 disabled:opacity-50 ${
              isLiked
                ? 'bg-blue-700'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <ThumbsUp size={18} />
            {isLiked ? 'Liked' : 'Like'}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 hover:bg-gray-700"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-gray-900 p-4">
        <p className="font-semibold">
          {video.views} views
        </p>

        <p className="mt-1 text-sm text-gray-400">
          {formatDuration(video.duration)}
          {video.createdAt &&
            ` · ${new Date(video.createdAt).toLocaleDateString()}`}
        </p>

        <p className="mt-3 whitespace-pre-wrap text-gray-300">
          {video.description || 'No description available.'}
        </p>
      </div>
    </div>
  )
}

export default WatchVideo
