import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Auth from './pages/auth.jsx'
import Dash from './pages/dash.jsx'
import MyProfile from './pages/myprofile.jsx'
import ProjectIdeas from './pages/projectideas.jsx'
import SubmitIdea from './pages/submitidea.jsx'
import GroupList from './pages/grouplist.jsx'
import CreateGroup from './pages/creategroup.jsx'
import NewsPage from './pages/newspage.jsx'
import FloatingChatbot from './components/FloatingChatbot.jsx'
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
          <Route path="/submit-idea" element={<SubmitIdea />} />
          <Route path="/groups" element={<GroupList />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/news" element={<NewsPage />} />
        </Routes>

        {/* Floating Chatbot - only visible when authenticated */}
        <FloatingChatbot />
      </Router>
    </div>
  )
}

export default App
