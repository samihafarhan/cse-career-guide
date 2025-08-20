// careerresult.jsx - Working Version
"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getCareerPath } from "@/services/careerPathservice"

export default function CareerResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [careerData, setCareerData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

    fetchCareerData()
  }, [searchParams])

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your AI-Powered Career Guidance</h2>
            </div>
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
              {careerData.suggestion || "Processing your career guidance..."}
            </p>
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
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}