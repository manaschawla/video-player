
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical } from 'lucide-react'

const VideoCard = ({ video }) => {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-800">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
          {video.duration}
        </span>
      </div>

      <div className="mt-3 flex gap-3">
        <img
          src={video.avatar}
          alt={video.channel}
          className="h-10 w-10 rounded-full bg-gray-700 object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-white">
            {video.title}
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            {video.channel}
          </p>

          <p className="text-sm text-gray-400">
            {video.views} views · {video.uploadedAt}
          </p>
        </div>

        <button
          aria-label="More video options"
          className="h-fit rounded-full p-1 text-gray-400 hover:bg-gray-800"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  )
}

export default VideoCard
