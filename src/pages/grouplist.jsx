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
import { Badge } from '@/components/ui/badge'
import { BeatLoader } from 'react-spinners'
import Error from '../components/error'
import { getGroupsWithDetails } from '../services/grouplist_services'
import { getUserProfile } from '../services/projectideas_services'
import { 
  sendJoinRequest, 
  getGroupJoinRequests, 
  approveJoinRequest,
  rejectJoinRequest,
  hasExistingJoinRequest,
  isGroupMember 
} from '../services/groupJoinService'
import { isStudent, isProfessor } from '@/utils/roleUtils'
import { useAuthCheck } from '@/context'

const GroupList = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  const [joinRequests, setJoinRequests] = useState({})
  const [pendingRequests, setPendingRequests] = useState({})
  const [actionLoading, setActionLoading] = useState({})
  
  const projectId = searchParams.get('projectId')
  const projectTitle = searchParams.get('projectTitle')
  const isGroupCreated = searchParams.get('created')

  // Fetch user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true)
        
        if (user?.id) {
          // Fetch user profile data
          const profile = await getUserProfile(user.id)
          setUserProfile(profile)
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
        const data = await getGroupsWithDetails(projectId || null, user?.id)
        setGroups(data)
        
        // Load join requests for groups created by current user
        if (user?.id) {
          const requestsMap = {}
          await Promise.all(
            data.filter(group => group.created_by === user.id).map(async (group) => {
              try {
                const requests = await getGroupJoinRequests(group.id)
                requestsMap[group.id] = requests
              } catch (error) {
                console.error(`Error loading requests for group ${group.id}:`, error)
                requestsMap[group.id] = []
              }
            })
          )
          setJoinRequests(requestsMap)
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchGroups()
    }
  }, [projectId, user?.id])

  // Handle join group request
  const handleJoinGroup = async (groupId) => {
    if (!user?.id) return
    
    try {
      setActionLoading(prev => ({ ...prev, [groupId]: true }))
      await sendJoinRequest(groupId, user.id)
      
      // Update the group's user_has_requested status
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, user_has_requested: true, can_join: false }
          : group
      ))
      
      alert('Join request sent successfully!')
    } catch (error) {
      console.error('Error sending join request:', error)
      alert('Failed to send join request. You may have already requested to join this group.')
    } finally {
      setActionLoading(prev => ({ ...prev, [groupId]: false }))
    }
  }

  // Handle approve/reject join request
  const handleRespondToRequest = async (userId, action, groupId) => {
    if (!user?.id) return
    
    const loadingKey = `${groupId}-${userId}`
    
    try {
      setActionLoading(prev => ({ ...prev, [loadingKey]: true }))
      
      if (action === 'approved') {
        await approveJoinRequest(groupId, userId)
      } else {
        await rejectJoinRequest(groupId, userId)
      }
      
      // Refresh join requests for this group
      const updatedRequests = await getGroupJoinRequests(groupId)
      setJoinRequests(prev => ({
        ...prev,
        [groupId]: updatedRequests
      }))
      
      // Refresh groups data to update counts
      const updatedGroups = await getGroupsWithDetails(projectId || null, user.id)
      setGroups(updatedGroups)
      
      alert(`Request ${action} successfully!`)
    } catch (error) {
      console.error('Error responding to request:', error)
      alert('Failed to respond to request. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleBackToProjects = () => {
    navigate('/project-ideas')
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
          {!userLoading && isStudent(userProfile) && (
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
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-blue-600">
                        {group.name}
                      </CardTitle>
                      {group.is_creator && group.pending_requests_count > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {group.pending_requests_count} pending
                        </Badge>
                      )}
                    </div>
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
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Members:</h4>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          let members = group.members || []
                          // Handle case where members might be stored as string instead of array
                          if (typeof members === 'string') {
                            try {
                              members = JSON.parse(members)
                            } catch (e) {
                              members = []
                            }
                          }
                          return Array.isArray(members) ? members.length : 0
                        })()} member(s)
                        {group.is_creator && ' (You are the creator)'}
                        {group.is_member && !group.is_creator && ' (You are a member)'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Created by:</h4>
                      <p className="text-sm text-gray-600">
                        {group.creator_email || 'Unknown'}
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
                    
                    {/* Join Requests for Group Creators */}
                    {group.is_creator && joinRequests[group.id] && joinRequests[group.id].length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="font-semibold text-gray-800 mb-2">Pending Join Requests:</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {joinRequests[group.id].map((profile) => (
                            <div key={profile.id} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="font-semibold text-gray-900">
                                      {profile.username || profile.email || 'Unknown User'}
                                    </p>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {profile.role || 'Student'}
                                    </span>
                                  </div>
                                  
                                  <div className="text-sm text-gray-600 mb-2">
                                    <p><span className="font-medium">Email:</span> {profile.email}</p>
                                    <p><span className="font-medium">User ID:</span> {profile.id}</p>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 ml-3">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleRespondToRequest(profile.id, 'approved', group.id)}
                                    className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700"
                                    disabled={actionLoading[`${group.id}-${profile.id}`]}
                                  >
                                    {actionLoading[`${group.id}-${profile.id}`] ? 'Processing...' : 'Accept'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRespondToRequest(profile.id, 'rejected', group.id)}
                                    className="text-xs px-3 py-1 border-red-300 text-red-600 hover:bg-red-50"
                                    disabled={actionLoading[`${group.id}-${profile.id}`]}
                                  >
                                    {actionLoading[`${group.id}-${profile.id}`] ? 'Processing...' : 'Reject'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* View Details Button for Members */}
                    {!userLoading && (group.is_member || group.is_creator) && (
                      <div className="pt-3">
                        <Button 
                          className="w-full" 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          View Group Details
                        </Button>
                      </div>
                    )}
                    
                    {/* Join Button for Non-creators */}
                    {!userLoading && isStudent(userProfile) && !group.is_creator && !group.is_member && (
                      <div className="pt-3">
                        {group.user_request_status === 'pending' ? (
                          <Button className="w-full" size="sm" disabled>
                            Request Pending
                          </Button>
                        ) : group.user_request_status === 'rejected' ? (
                          <Button className="w-full" size="sm" disabled variant="outline">
                            Request Rejected
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={actionLoading[group.id]}
                          >
                            {actionLoading[group.id] ? (
                              <>
                                <BeatLoader size={4} color="white" className="mr-2" />
                                Sending...
                              </>
                            ) : (
                              'Join Group'
                            )}
                          </Button>
                        )}
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
