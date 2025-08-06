import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Auth from './pages/auth.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
