
import React, { useEffect, useState } from 'react'
import VideoCard from '../components/VideoCard'
import api from '../api/axios'

const Home = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/videos')
        console.log('Videos API response:', response.data)

        // Adjust this path after checking your API response.
        setVideos(response.data.data.videos)
      } catch (error) {
        console.error('Fetch videos error:', error.response?.data || error.message)
        setError('Failed to load videos. Check the API endpoint.')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (loading) {
    return <p className="text-white">Loading videos...</p>
  }

  if (error) {
    return <p className="text-red-400">{error}</p>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">
        Recommended videos
      </h1>

      {videos.length === 0 ? (
        <p className="text-gray-400">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={{
              ...video,
              id: video._id,
              avatar: video.owner?.avatar,
              channel: video.owner?.username || 'Unknown channel',
              views: video.views,
              uploadedAt: video.createdAt
                ? new Date(video.createdAt).toLocaleDateString()
                : '',
              duration: video.duration,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
