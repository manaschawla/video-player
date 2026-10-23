
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const EditVideo = () => {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  // Fetch video details
  useEffect(() => {
    if (authLoading || !user) return

    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/videos/${videoId}`)
        const video = response.data.data

        setTitle(video.title || '')
        setDescription(video.description || '')
      } catch (error) {
        console.error(
          'Fetch video error:',
          error.response?.data || error.message
        )

        setError(
          error.response?.data?.message || 'Failed to load video details'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId, authLoading, user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim() || !description.trim()) {
      setError('Title and description cannot be empty.')
      return
    }

    try {
      setSaving(true)

      await api.patch(`/videos/update/${videoId}`, {
        title: title.trim(),
        description: description.trim()
      })

      setSuccess('Video details updated successfully!')

      setTimeout(() => {
        navigate('/my-videos')
      }, 1000)
    } catch (error) {
      console.error(
        'Update video error:',
        error.response?.data || error.message
      )

      setError(
        error.response?.data?.message || 'Failed to update video'
      )
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="py-10 text-center text-gray-400">
        Loading video details...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl text-white">
      <button
        onClick={() => navigate('/my-videos')}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to My Videos
      </button>

      <h1 className="text-3xl font-bold">Edit Video</h1>

      <p className="mt-2 mb-8 text-gray-400">
        Update the title and description of your video.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Video Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter video title"
            maxLength={200}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your video"
            rows={6}
            required
            className="w-full resize-y rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-green-400">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default EditVideo
