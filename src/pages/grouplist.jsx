import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { BeatLoader } from 'react-spinners'
import Error from '../components/error'
import { getGroupsWithProjectDetails } from '../services/grouplist_services'
import { getUserProfile } from '../services/projectideas_services'
import { getCurrentUser } from '../db/apiAuth'
import { UrlState } from '@/context'

const GroupList = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = UrlState()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  
  const projectId = searchParams.get('projectId')
  const projectTitle = searchParams.get('projectTitle')
  const isGroupCreated = searchParams.get('created')

  // Check if current user is a student
  const isStudent = () => {
    return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'student'
  }

  // Check if current user is a professor
  const isProfessor = () => {
    return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'professor'
  }

  // Fetch user profile
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
        }
      } catch (error) {
        setUserError(error.message)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  useEffect(() => {
    // Show success message if group was just created
    if (isGroupCreated === 'true') {
      setShowSuccess(true)
      // Remove the created parameter from URL
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('created')
      navigate(`/groups?${newSearchParams.toString()}`, { replace: true })
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    }
  }, [isGroupCreated, navigate, searchParams])

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getGroupsWithProjectDetails(projectId || null)
        setGroups(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [projectId])

  const handleBackToProjects = () => {
    navigate('/project-ideas')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {projectId ? `Groups for: ${projectTitle || 'Selected Project'}` : 'All Available Groups'}
          </h1>
          {projectId && (
            <p className="text-gray-600 mt-2">
              Showing groups working on this specific project
            </p>
          )}
          {!projectId && (
            <p className="text-gray-600 mt-2">
              Showing all groups across all projects
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {!userLoading && isStudent() && (
            <Button 
              onClick={() => navigate(`/create-group${projectId ? `?projectId=${projectId}&projectTitle=${encodeURIComponent(projectTitle || '')}` : ''}`)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create New Group
            </Button>
          )}
          <Button onClick={handleBackToProjects} variant="outline">
            Back to Projects
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Group created successfully! 
              </p>
              <p className="text-sm text-green-600">
                Your new group is now visible to other students.
              </p>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <BeatLoader size={10} color="blue" />
          <span className="ml-2">Loading groups...</span>
        </div>
      )}

      {error && <Error message={error.message} />}

      {!loading && !error && groups && (
        <div className="space-y-4">
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">
                      {group.name}
                    </CardTitle>
                    {group.beginner_project_ideas && (
                      <CardDescription className="text-sm font-medium text-gray-700">
                        Project: {group.beginner_project_ideas.title}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Group Introduction:</h4>
                      <p className="text-gray-700">
                        {group.introduction || 'No introduction provided.'}
                      </p>
                    </div>
                    
                    {group.beginner_project_ideas && (
                      <div className="border-t pt-3">
                        <h4 className="font-semibold text-gray-800 mb-2">Project Details:</h4>
                        <p className="text-sm text-gray-600">
                          {group.beginner_project_ideas.description || 'No project description available.'}
                        </p>
                        {group.beginner_project_ideas.submitted_by && (
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted by: {group.beginner_project_ideas.submitted_by}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {!userLoading && isStudent() && (
                      <div className="pt-3">
                        <Button className="w-full" size="sm">
                          Join Group
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="space-y-3">
                  <p className="text-gray-500 text-lg">
                    {projectId 
                      ? 'No groups found for this project yet.' 
                      : 'No groups available at the moment.'
                    }
                  </p>
                  <p className="text-gray-400 text-sm">
                    {projectId 
                      ? 'Be the first to create a group for this project!' 
                      : 'Check back later for new groups.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default GroupList
