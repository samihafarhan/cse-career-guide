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
import { submitWorkOpportunity, getUserProfile } from '../services/workOpportunityService'
import { useAuthCheck } from '@/context'

// Validation schema for work opportunity submission using Yup
const workOpportunitySchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(200, 'Title is too long'),
  type: Yup.string()
    .required('Please select a type')
    .oneOf(['job', 'internship'], 'Invalid type selected'),
  salary_range: Yup.string()
    .required('Salary range is required')
    .max(100, 'Salary range is too long'),
  description: Yup.string()
    .required('Description is required')
    .max(1000, 'Description is too long'),
  apply_link: Yup.string()
    .required('Application link is required')
    .url('Please enter a valid URL')
})

const SubmitWorkOpportunity = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    salary_range: '',
    description: '',
    apply_link: '',
    submitted_by: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()

  // Fetch user profile
  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setUserLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Check if current user can submit opportunities (professor or alumni)
  const canSubmitOpportunities = () => {
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
      await workOpportunitySchema.validate(formData, { abortEarly: false })
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
      
      // Submit work opportunity to database
      await submitWorkOpportunity(submissionData)
      
      // Navigate back to work opportunities page with success message
      navigate('/work-opportunities?submitted=true')
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || userLoading) {
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
  if (!canSubmitOpportunities()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Only professors and alumni are allowed to post work opportunities.
            </p>
            <Button onClick={() => navigate('/work-opportunities')} variant="outline">
              Back to Work Opportunities
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
          <CardTitle>Post Work Opportunity</CardTitle>
          <CardDescription>
            Share job and internship opportunities to help students kickstart their careers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="block text-gray-700 mb-2">
                Job/Internship Title *
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Software Engineer Intern, Frontend Developer"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <Label className="block text-gray-700 mb-2">
                Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
                required
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Choose opportunity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {/* Salary Range */}
            <div>
              <Label htmlFor="salary_range" className="block text-gray-700 mb-2">
                Salary Range *
              </Label>
              <Input
                id="salary_range"
                name="salary_range"
                type="text"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="e.g., $15-25/hour, $60,000-80,000/year, Competitive"
                className={errors.salary_range ? 'border-red-500' : ''}
              />
              {errors.salary_range && (
                <p className="text-red-500 text-sm mt-1">{errors.salary_range}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="block text-gray-700 mb-2">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Provide a brief description of the role, requirements, and what makes this opportunity valuable for students..."
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Apply Link */}
            <div>
              <Label htmlFor="apply_link" className="block text-gray-700 mb-2">
                Application Link *
              </Label>
              <Input
                id="apply_link"
                name="apply_link"
                type="url"
                value={formData.apply_link}
                onChange={handleChange}
                placeholder="https://company.com/careers/job-posting"
                className={errors.apply_link ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-600 mt-1">
                Link to the company's application page where students can apply
              </p>
              {errors.apply_link && (
                <p className="text-red-500 text-sm mt-1">{errors.apply_link}</p>
              )}
            </div>

            {/* Submitted By */}
            <div>
              <Label htmlFor="submitted_by" className="block text-gray-700 mb-2">
                Posted By
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
                onClick={() => navigate('/work-opportunities')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Posting...' : 'Post Opportunity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmitWorkOpportunity
