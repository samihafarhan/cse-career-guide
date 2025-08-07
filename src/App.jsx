import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Auth from './pages/auth.jsx'
import MyProfile from './pages/myprofile.jsx'
import ProjectIdeas from './pages/projectideas.jsx'
import GroupList from './pages/grouplist.jsx'
import Chatbot from './components/chatbot.jsx'
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
          <Route path="/project-ideas" element={<ProjectIdeas />} />
          <Route path="/groups" element={<GroupList />} />
        </Routes>

        <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">My App with Gemini AI</h1>
          <Chatbot />
        </div>
      </main>
      </Router>
    </div>
  )
}

export default App
