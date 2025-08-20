"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import GeminiService from "../services/geminiService"

export default function SeePath() {
  const [flowchart, setFlowchart] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const careerResult = searchParams.get("result")

  useEffect(() => {
    if (careerResult) {
      generateFlowchart()
    }
    // eslint-disable-next-line
  }, [careerResult])

  const generateFlowchart = async () => {
    try {
      setLoading(true)
      setError("")

      const prompt = `Give me a detailed flow chart about ${careerResult}`

      const response = await GeminiService.generateResponse(prompt)
      setFlowchart(response)
    } catch (err) {
      console.error("Error generating flowchart:", err)
      setError("Failed to generate career path flowchart. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
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
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-gray-800">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-gray-700">{children}</h3>,
                      p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700">{children}</li>,
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
                    {flowchart}
                  </ReactMarkdown>
                </div>
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
