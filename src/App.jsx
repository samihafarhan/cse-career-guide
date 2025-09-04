import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Landing from './pages/landing.jsx'
import Auth from './pages/auth.jsx'
import DashAlt from './pages/dashAlt.jsx'
import MyProfile from './pages/myprofile.jsx'
import ProjectIdeas from './pages/projectideas.jsx'
import SubmitIdea from './pages/submitidea.jsx'
import GroupList from './pages/grouplist.jsx'
import CreateGroup from './pages/creategroup.jsx'
import GroupDetails from './pages/groupdetails.jsx'
import NewsPage from './pages/newspage.jsx'
import InterviewQuestions from './pages/interviewquestions.jsx'
import SubmitInterviewQuestion from './pages/submitinterviewquestion.jsx'
import WorkOpportunities from './pages/workopportunities.jsx'
import SubmitWorkOpportunity from './pages/submitworkopportunity.jsx'
import Feedback from './pages/feedback.jsx'
import PostFeedback from './pages/postfeedback.jsx'
import Header from './components/Header.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { Toaster } from '@/components/ui/sonner'
import CareerPath from "./pages/careerpath.jsx"
import CareerResult from "./pages/careerresult.jsx"
import SeePath from "./pages/seepath.jsx"
import DashboardAdminSimple from "./pages/dashboardAdminSimple.jsx"
import Verification from "./pages/verification.jsx"
import { initAutoUpgrade } from './services/autoUpgradeService.js'
import './App.css'
import AdminDash from "./pages/admindash.jsx"
import AdminAnalysis from "./pages/adminanalysis.jsx" 
import SafetyDashboard from "./pages/safety.jsx"  // Add the missing dot

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
        <Route path="/dashboard" element={<DashAlt />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/project-ideas" element={<ProjectIdeas />} />
        <Route path="/submit-idea" element={<SubmitIdea />} />
        <Route path="/groups" element={<GroupList />} />
        <Route path="/groups/:groupId" element={<GroupDetails />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/interview-questions" element={<InterviewQuestions />} />
        <Route path="/submit-interview-question" element={<SubmitInterviewQuestion />} />
        <Route path="/work-opportunities" element={<WorkOpportunities />} />
        <Route path="/submit-work-opportunity" element={<SubmitWorkOpportunity />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/post-feedback" element={<PostFeedback />} />
        <Route path="/career-path" element={<CareerPath />} />
        <Route path="/careerresult" element={<CareerResult />} />
        <Route path="/seepath" element={<SeePath />} />
        <Route path="/verifyRole" element={<Verification />} />
        <Route path="/dashboardAdmin" element={<DashboardAdminSimple />} />
        <Route path="/admindash" element={<AdminDash />} />
        <Route path="/adminanalysis" element={<AdminAnalysis />} />
        <Route path="/safety" element={<SafetyDashboard />} />
      </Routes>
    </>
  );
}

function App() {
  // Initialize automatic role upgrade service when app starts
  useEffect(() => {
    initAutoUpgrade()
  }, [])

  return (
    <div className="App">
      <ChatProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </ChatProvider>
    </div>
  )
}

export default App