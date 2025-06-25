// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import AccountPage from './pages/AccountPage'
import DropsPage from './pages/DropsPage'
import ProfilePage from './pages/ProfilePage'
import { ProfileProvider } from './contexts/ProfileContext'
import MandatoryFormModal from './components/MandatoryFormModal'

function App() {
  return (
    <div className="App">
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/drops" element={<DropsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
        <MandatoryFormModal />
      </ProfileProvider>
    </div>
  )
}

export default App
