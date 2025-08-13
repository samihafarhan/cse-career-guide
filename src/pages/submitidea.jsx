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
import { getCurrentUser } from '../db/apiAuth'
import { UrlState } from '@/context'

// Validation schema for project idea submission
const projectIdeaSchema = Yup.object().shape({
  title: Yup.string()
    .required('Project title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: Yup.string()
    .required('Project description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  submitted_by: Yup.string()
    .required('Submitter name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
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
  const { user } = UrlState()

  // Fetch user profile and auto-fill submitted_by field
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true)
        
        // Get current user from auth
        const authUser = await getCurrentUser()
        
        if (authUser?.id) {
          // Fetch user profile data
          const profile = await getUserProfile(authUser.id)
          setUserProfile(profile)
          
          // Auto-fill submitted_by with username or email
          if (profile?.username) {
            setFormData(prev => ({
              ...prev,
              submitted_by: profile.username
            }))
          } else if (authUser?.email) {
            setFormData(prev => ({
              ...prev,
              submitted_by: authUser.email
            }))
          }
        }
      } catch (error) {
        setUserError(error.message)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Check if current user is a professor
  const isProfessor = () => {
    return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'professor'
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
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
      
      // Submit project idea to database
      await submitProjectIdea(formData)
      
      // Navigate back to project ideas page with success message
      navigate('/project-ideas?submitted=true')
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
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
                Submitted By *
              </Label>
              <Input
                id="submitted_by"
                name="submitted_by"
                type="text"
                value={formData.submitted_by}
                onChange={handleChange}
                placeholder="Your name or identifier"
                className={errors.submitted_by ? 'border-red-500' : ''}
              />
              {errors.submitted_by && (
                <p className="text-red-500 text-sm mt-1">{errors.submitted_by}</p>
              )}
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