
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import WatchVideo from './pages/WatchVideo'
import Login from './pages/Login'
import Register from './pages/Register'

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

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
