
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ThumbsUp,
  Share2,
  MessageCircle
} from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const WatchVideo = () => {
  const { videoId } = useParams()
  const { user } = useAuth()

  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)

  const [actionLoading, setActionLoading] = useState(false)

  // Comments state
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsError, setCommentsError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editedContent, setEditedContent] = useState('')
  const [commentActionLoading, setCommentActionLoading] = useState(false)

  // Fetch video details
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

        setError(
          error.response?.data?.message || 'Failed to load video'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  // Fetch like count and current user's like status
  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        const [countResponse, statusResponse] = await Promise.all([
          api.get(`/videos/likes/${videoId}`),
          api.get(`/videos/is-liked/${videoId}`)
        ])

        const countData = countResponse.data.data
        const statusData = statusResponse.data.data

        const count =
          typeof countData === 'number'
            ? countData
            : countData?.likesCount ??
              countData?.totalLikes ??
              countData?.count

        if (typeof count === 'number') {
          setLikeCount(count)
        } else if (Array.isArray(countData)) {
          setLikeCount(countData.length)
        }

        setIsLiked(
          typeof statusData === 'boolean'
            ? statusData
            : Boolean(statusData?.isLiked)
        )
      } catch (error) {
        console.error(
          'Failed to fetch like data:',
          error.response?.data || error.message
        )
      }
    }

    fetchLikeData()
  }, [videoId])

  // Fetch channel information
  useEffect(() => {
    const fetchChannelData = async () => {
      const username = video?.owner?.username

      if (!username) return

      try {
        const response = await api.get(`/users/c/${username}`)
        const channel = response.data.data

        setSubscriberCount(channel.subscribersCount || 0)
        setIsSubscribed(Boolean(channel.isSubscribed))
      } catch (error) {
        console.error(
          'Failed to fetch channel data:',
          error.response?.data || error.message
        )
      }
    }

    fetchChannelData()
  }, [video?.owner?.username])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setCommentsLoading(true)
        setCommentsError('')

        const response = await api.get(`/videos/comment/${videoId}`)
        const data = response.data.data

        setComments(
          Array.isArray(data)
            ? data
            : data?.comments || []
        )
      } catch (error) {
        console.error(
          'Fetch comments error:',
          error.response?.data || error.message
        )

        setCommentsError(
          error.response?.data?.message || 'Failed to load comments'
        )
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [videoId])

  // Like or unlike video
  const handleLike = async () => {
    if (actionLoading) return

    try {
      setActionLoading(true)

      if (isLiked) {
        await api.delete(`/videos/unlike/${videoId}`)
        setIsLiked(false)
        setLikeCount((count) => Math.max(0, count - 1))
      } else {
        await api.post(`/videos/like/${videoId}`)
        setIsLiked(true)
        setLikeCount((count) => count + 1)
      }
    } catch (error) {
      console.error(
        'Like action failed:',
        error.response?.data || error.message
      )

      alert(
        error.response?.data?.message || 'Please log in to like videos'
      )
    } finally {
      setActionLoading(false)
    }
  }

  // Subscribe or unsubscribe
  const handleSubscribe = async () => {
    const channelId = video?.owner?._id

    if (!channelId || actionLoading) return

    try {
      setActionLoading(true)

      if (isSubscribed) {
        await api.delete(`/subscriptions/c/${channelId}`)
        setIsSubscribed(false)
        setSubscriberCount((count) => Math.max(0, count - 1))
      } else {
        await api.post(`/subscriptions/c/${channelId}`)
        setIsSubscribed(true)
        setSubscriberCount((count) => count + 1)
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

  // Add comment
  const handleAddComment = async (event) => {
    event.preventDefault()

    if (!newComment.trim() || commentSubmitting) return

    try {
      setCommentSubmitting(true)

      await api.post(`/videos/comment/${videoId}`, {
        content: newComment.trim()
      })

      // Refetch comments to get populated author details
      const response = await api.get(`/videos/comment/${videoId}`)
      const data = response.data.data

      setComments(
        Array.isArray(data)
          ? data
          : data?.comments || []
      )

      setNewComment('')
      setCommentsError('')
    } catch (error) {
      console.error(
        'Add comment error:',
        error.response?.data || error.message
      )

      alert(
        error.response?.data?.message ||
        'Failed to add comment. Please log in.'
      )
    } finally {
      setCommentSubmitting(false)
    }
  }

  // Edit comment
  const handleUpdateComment = async (commentId) => {
    if (!editedContent.trim() || commentActionLoading) return

    try {
      setCommentActionLoading(true)

      await api.patch(`/videos/comments/${commentId}`, {
        content: editedContent.trim()
      })

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment._id === commentId
            ? { ...comment, content: editedContent.trim() }
            : comment
        )
      )

      setEditingCommentId(null)
      setEditedContent('')
    } catch (error) {
      console.error(
        'Update comment error:',
        error.response?.data || error.message
      )

      alert(
        error.response?.data?.message || 'Failed to update comment'
      )
    } finally {
      setCommentActionLoading(false)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (commentActionLoading) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this comment?'
    )

    if (!confirmed) return

    try {
      setCommentActionLoading(true)

      await api.delete(`/videos/comments/${commentId}`)

      setComments((currentComments) =>
        currentComments.filter((comment) => comment._id !== commentId)
      )
    } catch (error) {
      console.error(
        'Delete comment error:',
        error.response?.data || error.message
      )

      alert(
        error.response?.data?.message || 'Failed to delete comment'
      )
    } finally {
      setCommentActionLoading(false)
    }
  }

  // Share video
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Video link copied!')
    } catch {
      alert('Could not copy the video link')
    }
  }

  // Format duration
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
      {/* Video player */}
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

      {/* Video title */}
      <h1 className="mt-5 text-2xl font-bold">
        {video.title}
      </h1>

      {/* Channel details and actions */}
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

            <p className="text-sm text-gray-400">
              {subscriberCount.toLocaleString()} subscribers
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
            <span>{likeCount.toLocaleString()}</span>
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

      {/* Video information */}
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

      {/* Comments section */}
      <div className="mt-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
          <MessageCircle size={22} />
          Comments ({comments.length})
        </h2>

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Add a comment..."
            rows={2}
            maxLength={2000}
            className="w-full resize-y rounded-lg border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-red-500"
          />

          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={commentSubmitting || !newComment.trim()}
              className="rounded-full bg-red-600 px-5 py-2 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {commentsLoading ? (
          <p className="text-gray-400">Loading comments...</p>
        ) : commentsError ? (
          <p className="text-red-400">{commentsError}</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => {
              const ownerId =
                typeof comment.owner === 'object'
                  ? comment.owner?._id
                  : comment.owner

              const currentUserId = user?._id || user?.id
              const isCommentOwner =
                currentUserId &&
                ownerId &&
                String(currentUserId) === String(ownerId)

              return (
                <div key={comment._id} className="flex gap-3">
                  {comment.owner?.avatar ? (
                    <img
                      src={comment.owner.avatar}
                      alt="User avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 font-semibold">
                      {(comment.owner?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {typeof comment.owner === 'object'
                        ? comment.owner?.username ||
                          comment.owner?.fullName ||
                          'User'
                        : 'User'}
                    </p>

                    {editingCommentId === comment._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editedContent}
                          onChange={(event) =>
                            setEditedContent(event.target.value)
                          }
                          maxLength={2000}
                          rows={3}
                          className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-red-500"
                        />

                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateComment(comment._id)
                            }
                            disabled={
                              commentActionLoading ||
                              !editedContent.trim()
                            }
                            className="rounded-full bg-red-600 px-4 py-1.5 text-sm disabled:opacity-50"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditedContent('')
                            }}
                            className="rounded-full bg-gray-800 px-4 py-1.5 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 whitespace-pre-wrap break-words text-gray-300">
                        {comment.content}
                      </p>
                    )}

                    {comment.createdAt && (
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    )}

                    {isCommentOwner &&
                      editingCommentId !== comment._id && (
                        <div className="mt-2 flex gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment._id)
                              setEditedContent(comment.content || '')
                            }}
                            className="text-sm text-gray-400 hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteComment(comment._id)
                            }
                            disabled={commentActionLoading}
                            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WatchVideo
