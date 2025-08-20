import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Auth from './pages/auth.jsx'
import Dash from './pages/dash.jsx'
import MyProfile from './pages/myprofile.jsx'
import ProjectIdeas from './pages/projectideas.jsx'
import SubmitIdea from './pages/submitidea.jsx'
import GroupList from './pages/grouplist.jsx'
import CreateGroup from './pages/creategroup.jsx'
import NewsPage from './pages/newspage.jsx'
import Header from './components/Header.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import CareerPath from "./pages/careerpath.jsx"
import CareerResult from "./pages/careerresult.jsx"
import SeePath from "./pages/seepath.jsx"
import './App.css'

function AppContent() {
  const location = useLocation();
  const hideHeaderRoutes = ['/', '/auth'];
  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dash />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/project-ideas" element={<ProjectIdeas />} />
        <Route path="/submit-idea" element={<SubmitIdea />} />
        <Route path="/groups" element={<GroupList />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/career-path" element={<CareerPath />} />
        <Route path="/careerpath" element={<CareerPath />} />
        <Route path="/careerresult" element={<CareerResult />} />
        <Route path="/seepath" element={<SeePath />} /> {/* Add this line */}
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <ChatProvider>
        <Router>
          <AppContent />
        </Router>
      </ChatProvider>
    </div>
  )
}

export default App
