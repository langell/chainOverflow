import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './style.css'
import Navbar from './components/Navbar'
import QuestionModal from './components/QuestionModal'
import HandleModal from './components/HandleModal'
import Home from './pages/Home'
import QuestionDetail from './pages/QuestionDetail'
import Leaderboard from './pages/Leaderboard'
import DAO from './pages/DAO'
import FAQ from './pages/FAQ'

declare global {
  interface Window {
    ethereum?: any
  }
}

const App: React.FC = () => {
  return (
    <Router>
      <div id="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dao" element={<DAO />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
        </Routes>

        <QuestionModal />
        <HandleModal />
      </div>
    </Router>
  )
}

export default App
