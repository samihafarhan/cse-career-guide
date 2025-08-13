import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { BeatLoader } from 'react-spinners'
import Error from '../components/error'
import { createGroup } from '../services/grouplist_services'
import { getAllProjectIdeas, getUserProfile } from '../services/projectideas_services'
import { getCurrentUser } from '../db/apiAuth'
import { UrlState } from '@/context'
import * as Yup from 'yup'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CreateGroup = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = UrlState()
  
  const [formData, setFormData] = useState({
    groupName: '',
    introduction: '',
    projectId: searchParams.get('projectId') || ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  
  const preSelectedProjectTitle = searchParams.get('projectTitle')

  // Check if current user is a student
  const isStudent = () => {
    return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'student'
  }

  // Fetch current user and projects on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user info
        const currentUser = await getCurrentUser()
        
        if (currentUser?.id) {
          // Fetch user profile data
          const profile = await getUserProfile(currentUser.id)
          setUserProfile(profile)
        }

        // Fetch all projects for dropdown
        const projectsData = await getAllProjectIdeas()
        setProjects(projectsData)
      } catch (error) {
        console.error('Error fetching initial data:', error)
        setUserError(error.message)
      } finally {
        setProjectsLoading(false)
        setUserLoading(false)
      }
    }

    fetchInitialData()
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    try {
      // Validation schema
      const schema = Yup.object().shape({
        groupName: Yup.string().required('Group name is required'),
        introduction: Yup.string().required('Group introduction is required'),
        projectId: Yup.string().required('Please select a project')
      })

      await schema.validate(formData, { abortEarly: false })

      setLoading(true)

      // Create the group
      const newGroup = await createGroup({
        group_name: formData.groupName,
        introduction: formData.introduction,
        project_id: formData.projectId
      })

      // Navigate back to groups list with success message
      navigate('/groups?created=true')

    } catch (error) {
      if (error.inner) {
        // Yup validation errors
        const validationErrors = {}
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message
        })
        setErrors(validationErrors)
      } else {
        // Server/database errors
        setSubmitError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/groups')
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

  // Check if user is authorized (students only)
  if (!isStudent()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Only students are allowed to create groups.
            </p>
            <Button onClick={() => navigate('/groups')} variant="outline">
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          onClick={handleCancel} 
          variant="outline" 
          className="mb-4"
        >
          ← Back to Groups
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Create New Group</h1>
        <p className="text-gray-600">
          Start a new collaboration group for your project
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
          <CardDescription>
            Fill in the details below to create your new group
          </CardDescription>
          {submitError && <Error message={submitError} />}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Group Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Group Details</h3>
              
              <div className="space-y-1">
                <Label htmlFor="groupName" className="text-gray-700">Group Name *</Label>
                <Input
                  id="groupName"
                  name="groupName"
                  type="text"
                  placeholder="Enter a name for your group"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  className={errors.groupName ? 'border-red-500' : ''}
                />
                {errors.groupName && <Error message={errors.groupName} />}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="projectSelect" className="text-gray-700">Project *</Label>
                {projectsLoading ? (
                  <div className="flex items-center py-2">
                    <BeatLoader size={8} color="gray" />
                    <span className="ml-2 text-sm text-gray-500">Loading projects...</span>
                  </div>
                ) : (
                  <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({...prev, projectId: value}))}>
                    <SelectTrigger id="projectSelect" className={`w-full ${errors.projectId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {preSelectedProjectTitle && formData.projectId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pre-selected: {preSelectedProjectTitle}
                  </p>
                )}
                {errors.projectId && <Error message={errors.projectId} />}
              </div>

              <div className="space-y-1">
                <Label htmlFor="introduction" className="text-gray-700">Group Introduction *</Label>
                <Textarea
                  id="introduction"
                  name="introduction"
                  placeholder="Describe your group, goals, and what you're looking for in team members..."
                  value={formData.introduction}
                  onChange={handleInputChange}
                  rows={4}
                  className={errors.introduction ? 'border-red-500' : ''}
                />
                {errors.introduction && <Error message={errors.introduction} />}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? <BeatLoader size={8} color="white" /> : 'Create Group'}
              </Button>
              
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateGroup
