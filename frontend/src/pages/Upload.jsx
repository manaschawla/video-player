
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Image, Video, X } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const Upload = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(thumbnail)
    setThumbnailPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [thumbnail])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Please enter a title and description.')
      return
    }

    if (!videoFile) {
      setError('Please select a video file.')
      return
    }

    if (!thumbnail) {
      setError('Please select a thumbnail image.')
      return
    }

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('videoFile', videoFile)
    formData.append('thumbnail', thumbnail)

    try {
      setUploading(true)

      const response = await api.post('/videos/upload', formData)
      const uploadedVideo = response.data.data

      navigate(`/video/${uploadedVideo._id}`)
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message)

      setError(
        error.response?.data?.message ||
        'Video upload failed. Please try again.'
      )
    } finally {
      setUploading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
        <p className="text-gray-400 mb-8">
          Share your video with the StreamHub community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video file */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video File
            </label>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-8 cursor-pointer hover:border-red-500 transition">
              <Video size={40} className="text-red-500 mb-3" />

              <span className="font-medium">
                {videoFile ? videoFile.name : 'Choose a video'}
              </span>

              <span className="text-sm text-gray-400 mt-2">
                Select the video you want to upload
              </span>

              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(event) =>
                  setVideoFile(event.target.files?.[0] || null)
                }
              />
            </label>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Thumbnail
            </label>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-6 cursor-pointer hover:border-red-500 transition">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full max-h-64 object-contain rounded-lg"
                />
              ) : (
                <>
                  <Image size={36} className="text-red-500 mb-3" />
                  <span>Choose a thumbnail image</span>
                  <span className="text-sm text-gray-400 mt-2">
                    JPG, PNG, or another supported image format
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  setThumbnail(event.target.files?.[0] || null)
                }
              />
            </label>

            {thumbnail && (
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="flex items-center gap-1 text-sm text-red-400 mt-2 hover:text-red-300"
              >
                <X size={16} />
                Remove thumbnail
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter your video title"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell viewers about your video"
              rows={5}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-red-500 resize-y"
              required
            />
          </div>

          {error && (
            <p className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 font-semibold transition"
          >
            <UploadCloud size={20} />
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Upload
