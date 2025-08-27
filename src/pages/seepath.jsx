import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import GeminiService from "../services/geminiService"
import { useAuthCheck } from '@/context'

export default function SeePath() {
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()
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

      const prompt = `Give me a detailed flow chart about ${careerResult}. Please format your response using proper markdown with headers, lists, and emphasis where appropriate. Include step-by-step progression, required skills, education paths, and career milestones.`

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

  if (authLoading) {
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
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Career Path Flowchart</h1>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Career Result Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-green-600">Your Recommended Career Path</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactMarkdown
  components={{
    p: ({ children }) => <p className="text-lg font-medium text-gray-800">{children}</p>,
    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>
  }}
>
  {careerResult}
</ReactMarkdown>
          </CardContent>
        </Card>

        {/* Flowchart Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detailed Career Flowchart</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-lg text-gray-700 font-semibold">Generating your career path...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4 font-semibold">Error: {error}</p>
                <Button onClick={generateFlowchart} className="bg-green-600 hover:bg-green-700 font-semibold">
                  Try Again
                </Button>
              </div>
            )}

            {flowchart && !isLoading && (
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-green-200 pb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-l-4 border-green-500 pl-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-medium mb-3 text-gray-700">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-lg font-medium mb-2 text-gray-700">{children}</h4>,
                      h5: ({ children }) => <h5 className="text-base font-medium mb-2 text-gray-600">{children}</h5>,
                      h6: ({ children }) => <h6 className="text-sm font-medium mb-2 text-gray-600">{children}</h6>,
                      p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed text-base">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700 leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold text-gray-900 bg-yellow-50 px-1 rounded">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-700 font-medium">{children}</em>,
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-200">{children}</pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-green-500 pl-4 py-2 mb-4 bg-green-50 italic text-gray-700">{children}</blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                          <table className="min-w-full border-collapse border border-gray-300">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
                      th: ({ children }) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">{children}</th>,
                      td: ({ children }) => <td className="border border-gray-300 px-4 py-2 text-gray-700">{children}</td>,
                      hr: () => <hr className="my-6 border-t-2 border-gray-200" />,
                      a: ({ children, href }) => (
                        <a href={href} className="text-green-600 hover:text-green-700 underline font-medium" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
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
        {flowchart && !isLoading && (
          <div className="flex justify-center mt-8 gap-4">
            <Button
              onClick={generateFlowchart}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent font-semibold"
            >
              Regenerate Path
            </Button>
            <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 font-semibold">
              Print Flowchart
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}