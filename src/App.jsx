import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Auth from './pages/auth.jsx'
import Dash from './pages/dash.jsx'
import MyProfile from './pages/myprofile.jsx'
import ProjectIdeas from './pages/projectideas.jsx'
import GroupList from './pages/grouplist.jsx'
import NewsPage from './pages/newspage.jsx'
import ChatPage from './pages/chat.jsx'
import FloatingChatbot from './components/FloatingChatbot.jsx'
// import ChatbotDiagnostic from './components/ChatbotDiagnostic.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dash />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/projectideas" element={<ProjectIdeas />} />
          <Route path="/project-ideas" element={<ProjectIdeas />} />
          <Route path="/groups" element={<GroupList />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>

        {/* Floating Chatbot - only visible when authenticated */}
        <FloatingChatbot />
        
        Temporary Diagnostic Tool
        <ChatbotDiagnostic />
      </Router>
    </div>
  )
}

export default App
