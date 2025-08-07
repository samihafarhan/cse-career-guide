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

const GroupList = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const projectId = searchParams.get('projectId')
  const projectTitle = searchParams.get('projectTitle')

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
        <Button onClick={handleBackToProjects} variant="outline">
          Back to Projects
        </Button>
      </div>

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
                    
                    <div className="pt-3">
                      <Button className="w-full" size="sm">
                        Join Group
                      </Button>
                    </div>
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

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Project ID:</strong> {projectId || 'None'}</div>
            <div><strong>Project Title:</strong> {projectTitle || 'None'}</div>
            <div><strong>Groups Found:</strong> {groups?.length || 0}</div>
            <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error ? error.message : 'None'}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GroupList
