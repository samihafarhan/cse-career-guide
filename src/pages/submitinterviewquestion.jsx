import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import * as Yup from 'yup'
import { submitInterviewQuestion, getAllFields, getUserProfile } from '../services/interviewService'
import { useAuthCheck } from '@/context'

// Validation schema for interview question submission using Yup
const interviewQuestionSchema = Yup.object().shape({
  question: Yup.string()
    .required('Question is required')
    .max(500, 'Question is too long'),
  answer: Yup.string()
    .required('Answer is required')
    .max(2000, 'Answer is too long'),
  leetcode_link: Yup.string()
    .url('Please enter a valid URL')
    .nullable(),
  field_id: Yup.string()
    .required('Please select a field')
})

const SubmitInterviewQuestion = () => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    leetcode_link: '',
    field_id: '',
    submitted_by: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()

  // Fetch fields and user profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch fields
        setFieldsLoading(true)
        const fieldsData = await getAllFields()
        setFields(fieldsData)
        
        // Fetch user profile and auto-fill submitted_by
        if (user?.id) {
          setUserLoading(true)
          const profile = await getUserProfile(user.id)
          setUserProfile(profile)
          
          // Auto-fill submitted_by with user's email (unchangeable)
          if (user?.email) {
            setFormData(prev => ({
              ...prev,
              submitted_by: user.email
            }))
          }
        }
      } catch (error) {
        setUserError(error.message)
      } finally {
        setFieldsLoading(false)
        setUserLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Check if current user can submit questions (professor or alumni)
  const canSubmitQuestions = () => {
    if (!userProfile) return false
    const role = userProfile.role?.toLowerCase()
    return role === 'professor' || role === 'alumni'
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Prevent changing the submitted_by field
    if (name === 'submitted_by') {
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

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
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
      await interviewQuestionSchema.validate(formData, { abortEarly: false })
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
      
      // Ensure submitted_by is always the authenticated user's email
      const submissionData = {
        ...formData,
        submitted_by: user?.email
      }
      
      // Submit interview question to database
      await submitInterviewQuestion(submissionData)
      
      // Navigate back to interview questions page with success message
      navigate('/interview-questions?submitted=true')
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || userLoading || fieldsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Show error if user data couldn't be loaded
  if (userError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading user data: {userError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check if user is authorized (professor or alumni only)
  if (!canSubmitQuestions()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Only professors and alumni are allowed to submit interview questions.
            </p>
            <Button onClick={() => navigate('/interview-questions')} variant="outline">
              Back to Interview Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit Interview Question</CardTitle>
          <CardDescription>
            Help students prepare for interviews by sharing your knowledge and experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <Label htmlFor="question" className="block text-gray-700 mb-2">
                Interview Question *
              </Label>
              <Textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                rows={3}
                className={errors.question ? 'border-red-500' : ''}
              />
              {errors.question && (
                <p className="text-red-500 text-sm mt-1">{errors.question}</p>
              )}
            </div>

            {/* Field */}
            <div>
              <Label className="block text-gray-700 mb-2">
                Field/Subject *
              </Label>
              
              {fieldsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.field_id}
                  onValueChange={(value) => handleSelectChange('field_id', value)}
                  required
                >
                  <SelectTrigger className={errors.field_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choose a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={String(field.id)}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.field_id && (
                <p className="text-red-500 text-sm mt-1">{errors.field_id}</p>
              )}
            </div>

            {/* Answer */}
            <div>
              <Label htmlFor="answer" className="block text-gray-700 mb-2">
                Answer/Explanation *
              </Label>
              <Textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                rows={8}
                className={errors.answer ? 'border-red-500' : ''}
              />
              {errors.answer && (
                <p className="text-red-500 text-sm mt-1">{errors.answer}</p>
              )}
            </div>

            {/* Link (Optional) */}
            <div>
              <Label htmlFor="leetcode_link" className="block text-gray-700 mb-2">
                Link (Optional)
              </Label>
              <Input
                id="leetcode_link"
                name="leetcode_link"
                type="text"
                value={formData.leetcode_link}
                onChange={handleChange}
                className={errors.leetcode_link ? 'border-red-500' : ''}
              />
              {errors.leetcode_link && (
                <p className="text-red-500 text-sm mt-1">{errors.leetcode_link}</p>
              )}
            </div>

            {/* Submitted By */}
            <div>
              <Label htmlFor="submitted_by" className="block text-gray-700 mb-2">
                Submitted By
              </Label>
              <Input
                id="submitted_by"
                name="submitted_by"
                type="text"
                value={formData.submitted_by}
                readOnly
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
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
                onClick={() => navigate('/interview-questions')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Question'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmitInterviewQuestion
