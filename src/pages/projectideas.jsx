import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { BeatLoader, BarLoader } from 'react-spinners'
import Error from '../components/error'
import useFetch from '../hooks/use-fetch'
import { getAllProjectIdeas, getUserProfile } from '../services/projectideas_services'
import { getCurrentUser } from '../db/apiAuth'
import { UrlState } from '@/context'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ProjectIdeas = () => {
  const [searchParams] = useSearchParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const { data: projectIdeas, error: projectError, loading: projectLoading, fn: fetchProjectIdeas } = useFetch(getAllProjectIdeas)
  const { user } = UrlState()
  const navigate = useNavigate()
  const isIdeaSubmitted = searchParams.get('submitted')

  // Check for success message
  useEffect(() => {
    if (isIdeaSubmitted === 'true') {
      setShowSuccess(true)
      // Remove the submitted parameter from URL
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('submitted')
      navigate(`/project-ideas?${newSearchParams.toString()}`, { replace: true })
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    }
  }, [isIdeaSubmitted, navigate, searchParams])

  // Function to handle "Look for Groups" button click
  const handleLookForGroups = (projectId, projectTitle) => {
    navigate(`/groups?projectId=${projectId}&projectTitle=${encodeURIComponent(projectTitle)}`)
  }

  // Check if user is a professor (based on role field)
  const isProfessor = () => {
    return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'professor'
  }

  // Check if user is a student (based on role field)
  const isStudent = () => {
    return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'student'
  }

  // Handle submit idea button click
  const handleSubmitIdea = () => {
    navigate('/submit-idea')
  }

  // Fetch current user and their profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true)
        
        // Get current user from auth
        const authUser = await getCurrentUser()
        setCurrentUser(authUser)
        
        if (authUser?.id) {
          // Fetch user profile data
          const profile = await getUserProfile(authUser.id)
          setUserProfile(profile)
        }
      } catch (error) {
        setUserError(error.message)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Fetch project ideas
  useEffect(() => {
    fetchProjectIdeas()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Project Ideas</h1>
        {!userLoading && isProfessor() && (
          <Button 
            onClick={handleSubmitIdea}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit New Idea
          </Button>
        )}
      </div>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your project idea has been submitted successfully.</span>
        </div>
      )}
      
      {/* Project Ideas Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Beginner Project Ideas</h2>
        
        {projectLoading && (
          <div className="flex items-center justify-center py-8">
            <BeatLoader size={10} color="blue" />
            <span className="ml-2">Loading project ideas...</span>
          </div>
        )}
        
        {projectError && <Error message={projectError.message} />}
        
        {!projectLoading && !projectError && projectIdeas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectIdeas.length > 0 ? (
              projectIdeas.map((idea) => (
                <Card key={idea.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    {idea.submitted_by && (
                      <CardDescription className="text-sm text-gray-600">
                        Submitted by: {idea.submitted_by}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">
                      {idea.description || 'No description provided.'}
                    </p>
                    {!userLoading && isStudent() && (
                      <Button 
                        onClick={() => handleLookForGroups(idea.id, idea.title)}
                        className="w-full"
                        variant="outline"
                      >
                        Look for Groups
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">No project ideas found.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectIdeas
