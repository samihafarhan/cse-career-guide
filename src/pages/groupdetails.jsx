import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthCheck } from '@/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Label } from '../components/ui/label'
import LoadingSpinner from '../components/LoadingSpinner'

const GroupDetails = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()
  
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user?.id && groupId) {
      fetchGroupDetails()
    }
  }, [isAuthenticated, user?.id, groupId])

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      // Import services here to avoid circular dependencies
      const { getGroupDetails, getGroupMembers } = await import('../services/groupDetailsService')
      
      // Fetch group data and members
      const [groupData, membersData] = await Promise.all([
        getGroupDetails(groupId),
        getGroupMembers(groupId)
      ])
      
      setGroup(groupData)
      setMembers(membersData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    navigate('/auth')
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/groups')} variant="outline">
                Back to Groups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Group Not Found</h2>
              <p className="text-gray-600 mb-4">The group you're looking for doesn't exist or you don't have access to it.</p>
              <Button onClick={() => navigate('/groups')} variant="outline">
                Back to Groups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCreator = group.created_by === user.id
  const isMember = members.some(member => member.id === user.id) || isCreator

  if (!isMember) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">You are not a member of this group.</p>
              <Button onClick={() => navigate('/groups')} variant="outline">
                Back to Groups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-gray-600 mt-1">Group Details & Progress</p>
        </div>
        <Button onClick={() => navigate('/groups')} variant="outline">
          Back to Groups
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Group Information */}
        <Card>
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-semibold">Introduction</Label>
              <p className="text-sm text-gray-600 mt-1">{group.introduction}</p>
            </div>
            
            {group.beginner_project_ideas && (
              <div>
                <Label className="font-semibold">Project</Label>
                <p className="text-sm text-gray-600 mt-1">{group.beginner_project_ideas.title}</p>
                <p className="text-xs text-gray-500 mt-1">{group.beginner_project_ideas.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Group Members */}
      <Card>
        <CardHeader>
          <CardTitle>Group Members ({members.length})</CardTitle>
          <CardDescription>
            All members of this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {member.username || member.email}
                  </h4>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {member.role || 'Student'}
                    </Badge>
                    {member.id === group.created_by && (
                      <Badge variant="default" className="text-xs">
                        Creator
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Email:</span> {member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GroupDetails
