// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import AccountPage from './pages/AccountPage'
import GalleryPage from './pages/GalleryPage'
import { ProfileProvider } from './contexts/ProfileContext'
import MandatoryFormModal from './components/MandatoryFormModal'

function App() {
  return (
    <div className="App">
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
        <MandatoryFormModal />
      </ProfileProvider>
    </div>
  )
}

export default App
