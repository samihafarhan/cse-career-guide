import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ExternalLink, Briefcase, Users, DollarSign } from 'lucide-react'
import { getAllWorkOpportunities, getWorkOpportunitiesByType, getUserProfile } from '../services/workOpportunityService'
import { useAuthCheck } from '@/context'

const WorkOpportunities = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()
  
  const [opportunities, setOpportunities] = useState([])
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setUserProfile(null)
        }
      }
      setUserLoading(false)
    }

    if (isAuthenticated) {
      fetchUserProfile()
    } else {
      setUserLoading(false)
    }
  }, [user, isAuthenticated])

  // Fetch opportunities based on selected type
  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoading(true)
        setError(null)
        
        let opportunitiesData
        if (selectedType === 'all') {
          opportunitiesData = await getAllWorkOpportunities()
        } else {
          opportunitiesData = await getWorkOpportunitiesByType(selectedType)
        }
        
        setOpportunities(opportunitiesData)
      } catch (error) {
        console.error('Error fetching opportunities:', error)
        setOpportunities([])
        
        if (error.message === 'DATABASE_NOT_SETUP') {
          setError('Work opportunities database not set up yet. Please create the required database tables first.')
        } else {
          setError(`Error loading work opportunities: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [selectedType, isAuthenticated])

  // Check if user can submit opportunities (professor or alumni)
  const canSubmitOpportunities = () => {
    if (!userProfile) return false
    const role = userProfile.role?.toLowerCase()
    return role === 'professor' || role === 'alumni'
  }

  // Check if user can apply for opportunities (only students)
  const canApplyForOpportunities = () => {
    if (!userProfile) return false
    const role = userProfile.role?.toLowerCase()
    return role === 'student'
  }

  // Get type color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'job': return 'bg-blue-100 text-blue-800'
      case 'internship': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Handle type change
  const handleTypeChange = (type) => {
    setSelectedType(type)
    const params = new URLSearchParams(searchParams)
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    navigate(`?${params.toString()}`, { replace: true })
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Opportunities</h1>
          <p className="text-gray-600">Discover internships and job opportunities curated by faculty and alumni</p>
        </div>
        
        {canSubmitOpportunities() && (
          <Button 
            onClick={() => navigate('/submit-work-opportunity')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Opportunity
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="job">Jobs</SelectItem>
              <SelectItem value="internship">Internships</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{opportunities.length} opportunities available</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Skeleton className="h-6 w-6 rounded-full" />
          <span className="ml-2">Loading opportunities...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && opportunities.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-600 mb-4">
            {selectedType === 'all' 
              ? 'No work opportunities have been posted yet.' 
              : `No ${selectedType} opportunities found.`}
          </p>
          {canSubmitOpportunities() && (
            <Button onClick={() => navigate('/submit-work-opportunity')}>
              Post the first opportunity
            </Button>
          )}
        </div>
      )}

      {/* Opportunities List */}
      {!loading && !error && opportunities.length > 0 && (
        <div className="space-y-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{opportunity.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(opportunity.type)}>
                        {opportunity.type?.charAt(0).toUpperCase() + opportunity.type?.slice(1)}
                      </Badge>
                      {opportunity.salary_range && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <DollarSign className="h-3 w-3" />
                          <span>{opportunity.salary_range}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {opportunity.submitted_by && (
                  <CardDescription>
                    Posted by {opportunity.submitted_by}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{opportunity.description}</p>
                </div>

                {/* Apply Button - only visible to students */}
                {canApplyForOpportunities() && opportunity.apply_link && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      onClick={() => window.open(opportunity.apply_link, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Apply Now
                    </Button>
                  </div>
                )}

                {/* Info for non-students */}
                {!canApplyForOpportunities() && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 italic">
                      Application link available for students
                    </p>
                  </div>
                )}

                {/* Show created date */}
                <div className="pt-2 text-xs text-gray-500">
                  Posted on {new Date(opportunity.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkOpportunities
