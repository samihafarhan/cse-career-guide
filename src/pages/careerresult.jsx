import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { getCareerPath, getAllCareerPaths } from "@/services/careerPathservice"
import { useAuthCheck } from '@/context'

export default function CareerResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuthCheck()
  
  const [careerData, setCareerData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [careerHistory, setCareerHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        const id = searchParams.get("id")
        console.log("Fetching career data for ID:", id)

        if (!id) {
          setError("No career path ID provided")
          return
        }

        const data = await getCareerPath(id)
        console.log("Career data fetched:", data)
        setCareerData(data)
      } catch (error) {
        console.error("Failed to fetch career data:", error)
        setError(`Failed to load career data: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchCareerData()
    }
  }, [searchParams, isAuthenticated])

  const loadCareerHistory = async () => {
    try {
      setHistoryLoading(true)
      const history = await getAllCareerPaths(user.id)
      setCareerHistory(history)
      setShowHistory(true)
    } catch (error) {
      console.error("Failed to load career history:", error)
      setError("Failed to load career history")
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading your AI-generated career guidance...</div>
        </div>
      </div>
    )
  }

  if (error || !careerData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || "No career data found"}</div>
          <Button onClick={() => navigate("/careerpath")} className="bg-green-600 hover:bg-green-700">
            Generate New Career Path
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-center items-center py-8">
        <h1 className="text-4xl font-bold text-gray-900">CSE Career Guide</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center space-y-8">
          {/* AI-Generated Career Suggestion */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 max-w-3xl mx-auto border border-green-100">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-2 mr-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your AI-Powered Career Guidance</h2>
            </div>
            <div className="text-left">
              <div className="text-lg text-gray-800 leading-relaxed">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-800">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-gray-700">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-gray-800 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-800">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                    ),
                  }}
                >
                  {careerData.suggestion || "Processing your career guidance..."}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* See Path Button */}
          {careerData.suggestion && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-16 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => navigate(`/seepath?result=${encodeURIComponent(careerData.suggestion)}`)}
            >
              See Detailed Path →
            </Button>
          )}

          {/* User Input Summary */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">Field of Interest</h3>
              <p className="text-gray-700">{careerData.field}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2">Desired Skills</h3>
              <p className="text-gray-700">{careerData.desired_skills}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-2">Confident Skills</h3>
              <p className="text-gray-700">{careerData.confident_skills}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate("/careerpath")}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Generate New Path
            </Button>
            <Button 
              variant="outline" 
              onClick={loadCareerHistory}
              disabled={historyLoading}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {historyLoading ? "Loading..." : "View Previous Paths"}
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>

      {/* Career History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Previous Career Paths</h3>
              <button 
                onClick={() => setShowHistory(false)} 
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {careerHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No previous career paths found.</p>
              ) : (
                careerHistory.map((path) => (
                  <div 
                    key={path.id} 
                    className="border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowHistory(false)
                      navigate(`/careerresult?id=${path.id}`)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{path.field}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          Desired: {path.desired_skills}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(path.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}