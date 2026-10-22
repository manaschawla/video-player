import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Users,
  Video as VideoIcon,
  Bell,
  BellRing,
} from 'lucide-react'
import api from '../api/axios'
import VideoCard from '../components/VideoCard'
import { useAuth } from '../context/AuthContext'

const Channel = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [error, setError] = useState('')
  const [subscribeError, setSubscribeError] = useState('')

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true)
        setError('')

        const [channelResponse, videosResponse] = await Promise.all([
          api.get(`/users/c/${encodeURIComponent(username)}`),
          api.get('/videos'),
        ])

        const channelData = channelResponse.data.data
        const allVideos = videosResponse.data.data.videos || []

        setChannel(channelData)

        const channelVideos = allVideos.filter(
          video =>
            String(video.owner?._id) === String(channelData._id)
        )

        setVideos(channelVideos)
      } catch (error) {
        console.error(
          'Channel fetch error:',
          error.response?.data || error.message
        )

        setError(
          error.response?.data?.message || 'Failed to load channel.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchChannel()
    }
  }, [username])

  const isOwnChannel =
    user?._id && channel?._id &&
    String(user._id) === String(channel._id)

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (isOwnChannel || subscribeLoading || !channel) return

    setSubscribeLoading(true)
    setSubscribeError('')

    try {
      if (channel.isSubscribed) {
        await api.delete(`/subscriptions/c/${channel._id}`)

        setChannel(previous => ({
          ...previous,
          isSubscribed: false,
          subscribersCount: Math.max(
            0,
            (previous.subscribersCount || 0) - 1
          ),
        }))
      } else {
        await api.post(`/subscriptions/c/${channel._id}`)

        setChannel(previous => ({
          ...previous,
          isSubscribed: true,
          subscribersCount: (previous.subscribersCount || 0) + 1,
        }))
      }
    } catch (error) {
      console.error(
        'Subscription action error:',
        error.response?.data || error.message
      )

      setSubscribeError(
        error.response?.data?.message ||
          'Could not update subscription. Please try again.'
      )
    } finally {
      setSubscribeLoading(false)
    }
  }

  if (loading || authLoading) {
    return <p className="text-white">Loading channel...</p>
  }

  if (error) {
    return <p className="text-red-400">{error}</p>
  }

  if (!channel) {
    return <p className="text-white">Channel not found.</p>
  }

  return (
    <div className="space-y-8 text-white">
      <div
        className="h-40 rounded-2xl bg-gradient-to-r from-red-900 via-gray-800 to-gray-950 sm:h-56"
        style={
          channel.coverImage
            ? {
                backgroundImage: `url("${channel.coverImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {channel.avatar ? (
          <img
            src={channel.avatar}
            alt={`${channel.username} avatar`}
            className="h-24 w-24 rounded-full border border-gray-700 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
            <Users size={36} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">
            {channel.fullName || channel.username}
          </h1>

          <p className="mt-1 text-gray-400">
            @{channel.username}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            {channel.subscribersCount || 0} subscribers
            {' · '}
            {videos.length} videos
          </p>
        </div>

        {!isOwnChannel && (
          <button
            onClick={handleSubscribe}
            disabled={subscribeLoading}
            className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              channel.isSubscribed
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {channel.isSubscribed ? (
              <BellRing size={18} />
            ) : (
              <Bell size={18} />
            )}

            {subscribeLoading
              ? 'Please wait...'
              : channel.isSubscribed
                ? 'Subscribed'
                : 'Subscribe'}
          </button>
        )}
      </div>

      {subscribeError && (
        <p className="text-sm text-red-400">{subscribeError}</p>
      )}

      <div className="border-b border-gray-800 pb-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <VideoIcon size={21} />
          Videos
        </h2>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map(video => (
            <VideoCard
              key={video._id}
              video={{
                ...video,
                id: video._id,
                avatar: video.owner?.avatar,
                channel: video.owner?.username || 'Unknown channel',
                uploadedAt: video.createdAt
                  ? new Date(video.createdAt).toLocaleDateString()
                  : '',
              }}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-gray-400">
          No videos found for this channel.
        </p>
      )}
    </div>
  )
}

export default Channel