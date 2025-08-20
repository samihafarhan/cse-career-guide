// careerpath.jsx 
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCareerPath } from "@/services/careerPathservice"
import { Link, useNavigate } from "react-router-dom"
import { useAuthCheck } from '@/context'

export default function CareerPath() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuthCheck()
  
  const [formData, setFormData] = useState({
    field: "",
    desired_skills: "",
    confident_skills: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.field.trim() || !formData.desired_skills.trim()) {
      setMessage("Please fill in both the field and desired skills")
      setMessageType("error")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const careerData = {
        user_id: user.id, // Use actual user ID from context
        field: formData.field.trim(),
        desired_skills: formData.desired_skills.trim(),
        confident_skills: formData.confident_skills.trim(),
      }

      console.log("Submitting career data:", careerData)
      const result = await createCareerPath(careerData)
      console.log("Career path result:", result)

      setMessage("Career path generated successfully!")
      setMessageType("success")

      // Reset form
      setFormData({
        field: "",
        desired_skills: "",
        confident_skills: "",
      })

      // Navigate to results after 1.5 seconds
      setTimeout(() => {
        navigate(`/careerresult?id=${result.id}`)
      }, 1500)

    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setMessage(`Failed to generate career path: ${error.message}`)
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-white flex">
      {/* Main Content */}
      <div className="flex-1 p-8 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">CSE Career Guide</h1>
          {/* Removed Log Out button */}
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto space-y-8">
          {message && (
            <div
              className={`p-4 rounded-md text-center ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <Input
              placeholder="Enter a field(s) you want to work in (e.g., AI, Web Development, Data Science)"
              className="w-full h-12 text-base bg-gray-100 border-gray-200 focus:border-green-500 focus:ring-green-500"
              value={formData.field}
              onChange={(e) => handleInputChange("field", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Input
              placeholder="Skills which you desire (e.g., Machine Learning, React, Python)"
              className="w-full h-12 text-base bg-gray-100 border-gray-200 focus:border-green-500 focus:ring-green-500"
              value={formData.desired_skills}
              onChange={(e) => handleInputChange("desired_skills", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Input
              placeholder="Skills you are confident about (e.g., Java, HTML/CSS, Mathematics)"
              className="w-full h-12 text-base bg-gray-100 border-gray-200 focus:border-green-500 focus:ring-green-500"
              value={formData.confident_skills}
              onChange={(e) => handleInputChange("confident_skills", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-center pt-8">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 text-lg disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Generating AI Career Path..." : "Generate Career Path"}
            </Button>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-center text-gray-600 mt-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
              AI is analyzing your skills and generating personalized recommendations...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}