import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import * as Yup from 'yup'
import { BeatLoader } from 'react-spinners'
import Error from '../components/error'
import { submitProjectIdea, getUserProfile } from '../services/projectideas_services'
import { useAuthCheck } from '@/context'

// Validation schema for project idea submission
const projectIdeaSchema = Yup.object().shape({
  title: Yup.string()
    .required('Project title is required')
    .max(100, 'Title is too long'),
  description: Yup.string()
    .required('Project description is required')
    .max(1000, 'Description is too long')
})

const SubmitIdea = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submitted_by: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()

  // Fetch user profile and auto-fill submitted_by field
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true)
        
        if (user?.id) {
          // Fetch user profile data
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
        setUserLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  // Check if current user is a professor
  const isProfessor = () => {
    return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'professor'
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

  // Validate form data
  const validateForm = async () => {
    try {
      await projectIdeaSchema.validate(formData, { abortEarly: false })
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
      
      // Submit project idea to database
      await submitProjectIdea(submissionData)
      
      // Navigate back to project ideas page with success message
      navigate('/project-ideas?submitted=true')
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Show loading while checking user permissions
  if (userLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <BeatLoader size={10} color="blue" />
          <span className="ml-2">Loading user data...</span>
        </div>
      </div>
    )
  }

  // Show error if user data couldn't be loaded
  if (userError) {
    return (
      <div className="container mx-auto p-6">
        <Error message={`Error loading user data: ${userError}`} />
      </div>
    )
  }

  // Check if user is authorized (professor only)
  if (!isProfessor()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Only professors are allowed to submit project ideas.
            </p>
            <Button onClick={() => navigate('/project-ideas')} variant="outline">
              Back to Project Ideas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit New Project Idea</CardTitle>
          <CardDescription>
            Share a new project idea with students to help them build their portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <Label htmlFor="title" className="block text-gray-700 mb-2">
                Project Title *
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project title (e.g., E-commerce Website)"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Project Description */}
            <div>
              <Label htmlFor="description" className="block text-gray-700 mb-2">
                Project Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the project, its objectives, technologies to be used, and learning outcomes..."
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
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
              <p className="text-sm text-gray-500 mt-1">
                This field is automatically set to your email address and cannot be changed.
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/project-ideas')}
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
                  'Submit Project Idea'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmitIdea