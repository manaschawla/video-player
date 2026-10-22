
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical } from 'lucide-react'

const VideoCard = ({ video }) => {
  const navigate = useNavigate()

  const handleVideoClick = () => {
    navigate(`/video/${video.id}`)
  }

  const handleChannelClick = (event) => {
    event.stopPropagation()

    if (video.owner?.username) {
      navigate(`/channel/${video.owner.username}`)
    }
  }

  return (
    <div
      onClick={handleVideoClick}
      className="cursor-pointer space-y-3"
    >
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="aspect-video w-full rounded-xl object-cover"
        />

        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
          {video.duration}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleChannelClick}
          className="shrink-0"
          aria-label={`Visit ${video.channel || 'channel'}`}
        >
          {video.avatar ? (
            <img
              src={video.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-700" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-white">
            {video.title}
          </h3>

          <button
            onClick={handleChannelClick}
            className="mt-1 block text-sm text-gray-400 hover:text-white"
          >
            {video.channel || 'Unknown channel'}
          </button>

          <p className="text-sm text-gray-400">
            {video.views || 0} views
            {video.uploadedAt ? ` · ${video.uploadedAt}` : ''}
          </p>
        </div>

        <button
          onClick={(event) => event.stopPropagation()}
          aria-label="More options"
          className="h-fit rounded-full p-1 text-gray-400 hover:bg-gray-800"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  )
}

export default VideoCard
