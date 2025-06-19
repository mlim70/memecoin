// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AccountPage from './pages/AccountPage'
import { UserProvider } from './contexts/UserContext'

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </div>
    </UserProvider>
  )
}

export default App
