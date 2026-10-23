
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Upload from './pages/Upload'
import Home from './pages/Home'
import WatchVideo from './pages/WatchVideo'
import Login from './pages/Login'
import Register from './pages/Register'
import Channel from './pages/Channel'
import Profile from './pages/Profile'
import MyVideos from './pages/MyVideos'
import EditVideo from './pages/EditVideo'
import CreatorDashboard from './pages/CreatorDashboard'
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/video/:videoId"
          element={
            <MainLayout>
              <WatchVideo />
            </MainLayout>
          }
        />

        <Route
          path="/channel/:username"
          element={
            <MainLayout>
              <Channel />
            </MainLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/upload"
          element={
            <MainLayout>
              <Upload />
            </MainLayout>
          }
        />
         <Route
    path="/my-videos"
    element={
      <MainLayout>
        <MyVideos />
      </MainLayout>
    }
  />
      <Route
      path="/edit-video/:videoId"
      element={
        <MainLayout>
          <EditVideo />
        </MainLayout>
      }
    />
        <Route
      path="/creator-dashboard"
      element={
        <MainLayout>
          <CreatorDashboard />
        </MainLayout>
      }
    />
      </Routes>
       
    </BrowserRouter>
  )
}

export default App
