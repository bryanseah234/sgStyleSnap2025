import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Cabinet from './pages/Cabinet'
import Dashboard from './pages/Dashboard'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import FriendCabinet from './pages/FriendCabinet'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cabinet" element={<Cabinet />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friend-cabinet" element={<FriendCabinet />} />
      </Routes>
    </Layout>
  )
}

export default App
