import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as Yup from 'yup'
import { BeatLoader } from 'react-spinners'
import { submitFeedback } from '../services/feedbackService'
import { useAuthCheck } from '@/context'

// Validation schema for feedback submission
const feedbackSchema = Yup.object().shape({
  feedback_subject: Yup.string()
    .required('Feedback subject is required')
    .max(200, 'Subject is too long'),
  feedback_desc: Yup.string()
    .required('Feedback description is required')
    .max(2000, 'Description is too long')
})

const PostFeedback = () => {
  const [formData, setFormData] = useState({
    email: '',
    feedback_subject: '',
    feedback_desc: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()

  // Auto-fill email when user is loaded
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }))
    }
  }, [user])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Prevent changing the email field
    if (name === 'email') {
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form data
  const validateForm = async () => {
    try {
      await feedbackSchema.validate(formData, { abortEarly: false })
      setErrors({})
      return true
    } catch (error) {
      const newErrors = {}
      error.inner.forEach(err => {
        newErrors[err.path] = err.message
      })
      setErrors(newErrors)
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const isValid = await validateForm()
    if (!isValid) return
    
    try {
      setLoading(true)
      
      // Ensure email is always the authenticated user's email
      const submissionData = {
        ...formData,
        email: user?.email
      }
      
      // Submit feedback to database
      await submitFeedback(submissionData)
      
      // Navigate back to feedback page with success message
      navigate('/feedback?submitted=true')
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BeatLoader size={10} color="blue" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            Share your feedback, suggestions, or report issues to help us improve the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                This field is automatically set to your email address and cannot be changed.
              </p>
            </div>

            {/* Feedback Subject */}
            <div>
              <Label htmlFor="feedback_subject" className="block text-gray-700 mb-2">
                Subject *
              </Label>
              <Input
                id="feedback_subject"
                name="feedback_subject"
                type="text"
                value={formData.feedback_subject}
                onChange={handleChange}
                placeholder="Enter feedback subject (e.g., Feature Request, Bug Report, General Feedback)"
                className={errors.feedback_subject ? 'border-red-500' : ''}
              />
              {errors.feedback_subject && (
                <p className="text-red-500 text-sm mt-1">{errors.feedback_subject}</p>
              )}
            </div>

            {/* Feedback Description */}
            <div>
              <Label htmlFor="feedback_desc" className="block text-gray-700 mb-2">
                Description *
              </Label>
              <Textarea
                id="feedback_desc"
                name="feedback_desc"
                value={formData.feedback_desc}
                onChange={handleChange}
                placeholder="Please provide detailed feedback, suggestions, or describe any issues you've encountered..."
                rows={8}
                className={errors.feedback_desc ? 'border-red-500' : ''}
              />
              {errors.feedback_desc && (
                <p className="text-red-500 text-sm mt-1">{errors.feedback_desc}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/feedback')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <BeatLoader size={8} color="white" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PostFeedback
