import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './style.css'
import Navbar from './components/Navbar'
import QuestionModal from './components/QuestionModal'
import Home from './pages/Home'
import QuestionDetail from './pages/QuestionDetail'

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
          <Route path="/question/:id" element={<QuestionDetail />} />
        </Routes>

        <QuestionModal />
      </div>
    </Router>
  )
}

export default App
