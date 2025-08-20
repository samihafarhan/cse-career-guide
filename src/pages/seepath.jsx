"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import GeminiService from "../services/geminiService"
import { useAuthCheck } from '@/context'

export default function SeePath() {
  const { user, isAuthenticated, loading } = useAuthCheck()
  const [flowchart, setFlowchart] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const careerResult = searchParams.get("result")

  useEffect(() => {
    if (careerResult && isAuthenticated) {
      generateFlowchart()
    }
    // eslint-disable-next-line
  }, [careerResult, isAuthenticated])

  const generateFlowchart = async () => {
    try {
      setIsLoading(true)
      setError("")

      const prompt = `Give me a detailed flow chart about ${careerResult}`

      const response = await GeminiService.generateResponse(prompt)
      setFlowchart(response)
    } catch (err) {
      console.error("Error generating flowchart:", err)
      setError("Failed to generate career path flowchart. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-center flex-1">Career Path Flowchart</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Career Result Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-green-600">Your Recommended Career Path</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{careerResult}</p>
          </CardContent>
        </Card>

        {/* Flowchart Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detailed Career Flowchart</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-lg">Generating your career path...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={generateFlowchart} className="bg-green-600 hover:bg-green-700">
                  Try Again
                </Button>
              </div>
            )}

            {flowchart && !loading && (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{flowchart}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {flowchart && !loading && (
          <div className="flex justify-center mt-8 gap-4">
            <Button
              onClick={generateFlowchart}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
            >
              Regenerate Path
            </Button>
            <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">
              Print Flowchart
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
