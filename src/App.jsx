import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Auth from './pages/auth.jsx'
import MyProfile from './pages/myprofile.jsx'
import ProjectIdeas from './pages/projectideas.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/projectideas" element={<ProjectIdeas />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
