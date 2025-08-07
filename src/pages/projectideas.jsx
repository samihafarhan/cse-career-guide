import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BeatLoader } from 'react-spinners'
import Error from '../components/error'
import useFetch from '../hooks/use-fetch'
import { getAllProjectIdeas, getUserProfile } from '../services/projectideas_services'
import { getCurrentUser } from '../db/apiAuth'
import { UrlState } from '@/context'

const ProjectIdeas = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)

  const { data: projectIdeas, error: projectError, loading: projectLoading, fn: fetchProjectIdeas } = useFetch(getAllProjectIdeas)
  const { user } = UrlState()

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
      <h1 className="text-3xl font-bold text-center mb-8">Project Ideas Demo</h1>
      
      {/* User Profile Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current User Profile</CardTitle>
          <CardDescription>Testing user authentication and profile fetching</CardDescription>
        </CardHeader>
        <CardContent>
          {userLoading && (
            <div className="flex items-center justify-center py-4">
              <BeatLoader size={10} color="blue" />
              <span className="ml-2">Loading user data...</span>
            </div>
          )}
          
          {userError && <Error message={userError} />}
          
          {!userLoading && !userError && currentUser && (
            <div className="space-y-3">
              <div>
                <strong>Auth User ID:</strong> {currentUser.id}
              </div>
              <div>
                <strong>Email:</strong> {currentUser.email}
              </div>
              
              {userProfile && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Profile Details:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Username:</strong> {userProfile.username || 'Not set'}</div>
                    <div><strong>Organization:</strong> {userProfile.organization || 'Not set'}</div>
                    <div><strong>Position:</strong> {userProfile.position || 'Not set'}</div>
                    <div><strong>Graduation Year:</strong> {userProfile.grad_year || 'Not set'}</div>
                    <div className="md:col-span-2"><strong>Bio:</strong> {userProfile.bio || 'Not set'}</div>
                    <div className="md:col-span-2"><strong>Skills:</strong> {userProfile.skills || 'Not set'}</div>
                  </div>
                </div>
              )}
              
              {!userProfile && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">No profile data found for this user.</p>
                </div>
              )}
            </div>
          )}
          
          {!userLoading && !userError && !currentUser && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-800">No user is currently logged in.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  <CardContent>
                    <p className="text-gray-700">
                      {idea.description || 'No description provided.'}
                    </p>
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
