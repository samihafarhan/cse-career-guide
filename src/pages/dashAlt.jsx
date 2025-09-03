import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BeatLoader } from 'react-spinners'
import AuthWrapper from '@/components/AuthWrapper'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuthCheck } from '@/context'
import { getUserProfile, updateUsername, checkUsernameExists } from '@/services/profileService'
import { getUserProjectParticipationCount } from '@/services/grouplist_services'
import useProfileUpdate from '@/hooks/useProfileUpdate'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const DashAlt = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuthCheck()
  const [profile, setProfile] = useState(null)
  const [weeklyGoal, setWeeklyGoal] = useState('')
  const [projectCount, setProjectCount] = useState(0)
  const [projectParticipation, setProjectParticipation] = useState(0)
  const [participationLoading, setParticipationLoading] = useState(true)
  const [goalSaving, setGoalSaving] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [isEditingGoal, setIsEditingGoal] = useState(false)

  // Username update functionality
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const usernameUpdate = useProfileUpdate(updateUsername, () => fetchProfile())

  // Debounced username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (!usernameUpdate.newValue.trim() || usernameUpdate.newValue.trim() === profile?.username || !user?.id) {
        setUsernameAvailable(null)
        return
      }

      setIsCheckingUsername(true)
      try {
        const exists = await checkUsernameExists(usernameUpdate.newValue.trim(), user.id)
        setUsernameAvailable(!exists)
      } catch (err) {
        console.error('Error checking username:', err)
        setUsernameAvailable(null)
      } finally {
        setIsCheckingUsername(false)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [usernameUpdate.newValue, profile?.username, user?.id])

  // Memoized profile completion calculation
  const profileCompletionPercentage = useMemo(() => {
    if (!profile) return 0
    
    const fields = ['username', 'bio', 'role', 'grad_year', 'organization', 'skills']
    
    const completedFields = fields.filter(field => 
      profile[field] && profile[field].toString().trim() !== ''
    ).length
    
    return Math.round((completedFields / fields.length) * 100)
  }, [profile])

  // Load profile data with optimized single query
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      try {
        setProfileLoading(true)
        
        // Load essential data first, then participation count separately
        const [profileData, projectCountResult] = await Promise.all([
          getUserProfile(user.id),
          supabase
            .from('project_ideas')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ])
        
        setProfile(profileData)
        
        if (profileData) {
          // Use memoized calculation instead of calling function
          setWeeklyGoal(profileData.weekly_goal || '')
          setIsEditingGoal(!profileData.weekly_goal) // Edit mode if no goal exists
        } else {
          setIsEditingGoal(true) // Edit mode if no profile
        }
        
        setProjectCount(projectCountResult.count || 0)
        
        // Load participation count separately to avoid blocking main UI
        setParticipationLoading(true)
        getUserProjectParticipationCount(user.id)
          .then(count => {
            setProjectParticipation(count || 0)
            setParticipationLoading(false)
          })
          .catch(error => {
            console.error('Error loading participation count:', error)
            setProjectParticipation(0)
            setParticipationLoading(false)
          })
        
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Save weekly goal
  const handleSaveGoal = async () => {
    if (!user?.id) {
      alert('User not found. Please try logging in again.')
      return
    }
    
    try {
      setGoalSaving(true)
      
      // Try to update existing profile first
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }
      
      if (existingProfile) {
        // Profile exists, update it
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ weekly_goal: weeklyGoal })
          .eq('id', user.id)
        
        if (updateError) throw updateError
      } else {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            weekly_goal: weeklyGoal,
            created_at: new Date().toISOString()
          })
        
        if (insertError) throw insertError
      }
      
      // Update local state
      setProfile(prev => ({ ...prev, weekly_goal: weeklyGoal }))
      setIsEditingGoal(false)
      alert('Weekly goal saved successfully!')
      
    } catch (error) {
      console.error('Error saving weekly goal:', error)
      alert(`Error saving weekly goal: ${error.message}. Please try again.`)
    } finally {
      setGoalSaving(false)
    }
  }

  // Get role badge color
  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'student': return 'default'
      case 'alumni': return 'secondary'
      case 'professor': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />
  }

  if (profileLoading) {
    return (
      <AuthWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
              <h1 className="text-4xl font-bold mb-2">Loading...</h1>
              <p className="text-blue-100 text-lg">Getting your profile ready...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome{profile?.username ? `, ${profile.username}` : ''}!
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to continue your career journey?
                </p>
                {!profile?.username && (
                  <div className="mt-4">
                    <Dialog open={usernameUpdate.isDialogOpen} onOpenChange={(open) => open ? usernameUpdate.openDialog(profile?.username) : usernameUpdate.closeDialog()}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                          onClick={() => usernameUpdate.openDialog(profile?.username)}
                        >
                          Set Username
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Set Your Username</DialogTitle>
                          <DialogDescription>
                            Choose a username to personalize your experience. This will be visible to other users.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              type="text"
                              placeholder="Enter your username"
                              value={usernameUpdate.newValue}
                              onChange={(e) => {
                                usernameUpdate.setNewValue(e.target.value)
                                usernameUpdate.setError(null)
                              }}
                              disabled={usernameUpdate.isUpdating}
                            />
                            {/* Username availability feedback */}
                            {isCheckingUsername && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <BeatLoader size={8} color="gray" />
                                <span className="ml-2">Checking availability...</span>
                              </div>
                            )}
                            {!isCheckingUsername && usernameAvailable === true && usernameUpdate.newValue.trim() && (
                              <div className="text-sm text-green-600 mt-1">
                                Username available
                              </div>
                            )}
                            {!isCheckingUsername && usernameAvailable === false && usernameUpdate.newValue.trim() && (
                              <div className="text-sm text-red-600 mt-1">
                                Username already taken
                              </div>
                            )}
                          </div>
                          {usernameUpdate.error && (
                            <div className="text-red-500 text-sm">
                              {usernameUpdate.error}
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={usernameUpdate.closeDialog}
                            disabled={usernameUpdate.isUpdating}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              const trimmedUsername = usernameUpdate.newValue.trim()
                              if (!trimmedUsername) {
                                usernameUpdate.setError('Username cannot be empty')
                                return
                              }
                              if (usernameAvailable === false) {
                                usernameUpdate.setError('This username is already taken. Please choose a different one.')
                                return
                              }
                              usernameUpdate.handleUpdate(user.id, trimmedUsername, 'Username')
                            }}
                            disabled={usernameUpdate.isUpdating || !usernameUpdate.newValue?.trim()}
                          >
                            {usernameUpdate.isUpdating ? (
                              <>
                                <BeatLoader size={8} color="white" />
                                <span className="ml-2">Setting...</span>
                              </>
                            ) : (
                              'Set Username'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              <div className="text-right">
                <Badge variant={getRoleBadgeVariant(profile?.role)} className="text-lg px-4 py-2">
                  {profile?.role || 'No Role Set'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={profileCompletionPercentage} className="w-full" />
                  <p className="text-2xl font-bold text-center">{profileCompletionPercentage}%</p>
                  <p className="text-sm text-gray-600 text-center">
                    {profileCompletionPercentage === 100 ? 'Profile Complete!' : 'Keep building your profile'}
                  </p>
                  {profileCompletionPercentage < 100 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate('/profile')}
                    >
                      Complete Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Role */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  Your Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <Badge 
                    variant={getRoleBadgeVariant(profile?.role)} 
                    className="text-xl px-6 py-3"
                  >
                    {profile?.role || 'No Role Set'}
                  </Badge>
                  
                  {profile?.role && profile?.verification_status !== 'verified' && (
                    <p className="text-sm text-orange-600 font-medium">
                      ⚠️ Pending Verification
                    </p>
                  )}
                  
                  {profile?.role && profile?.verification_status === 'verified' && (
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Verified
                    </p>
                  )}
                  
                  {!profile?.role && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate('/verifyRole')}
                    >
                      Verify Role
                    </Button>
                  )}
                  
                  {profile?.grad_year && (
                    <p className="text-sm text-gray-600">
                      Graduation Year: {profile.grad_year}
                    </p>
                  )}
                  {profile?.university && (
                    <p className="text-sm text-gray-600">
                      {profile.university}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Count */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  Your Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  {!profile?.role || profile?.verification_status !== 'verified' ? (
                    // No verified role
                    <>
                      <p className="text-xl font-bold text-gray-400">—</p>
                      <p className="text-sm text-gray-600">
                        Verify to join project groups and do projects
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/verifyRole')}
                      >
                        Verify Role
                      </Button>
                    </>
                  ) : profile.role === 'student' || profile.role === 'alumni' ? (
                    // Student/Alumni role
                    <>
                      {participationLoading ? (
                        <>
                          <div className="text-3xl font-bold text-gray-400">
                            <BeatLoader size={12} color="#3b82f6" />
                          </div>
                          <p className="text-sm text-gray-600">Loading projects...</p>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-blue-600">{projectParticipation}</p>
                          <p className="text-sm text-gray-600">
                            {projectParticipation === 0 ? 'Not in any projects yet' : 
                             projectParticipation === 1 ? 'Currently in 1 project' : 
                             `Currently in ${projectParticipation} projects`}
                          </p>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/project-ideas')}
                      >
                        {participationLoading ? 'View Projects' : 
                         projectParticipation === 0 ? 'Join Projects' : 'View Projects'}
                      </Button>
                    </>
                  ) : profile.role === 'professor' ? (
                    // Professor role
                    <>
                      <p className="text-3xl font-bold text-green-600">{projectCount}</p>
                      <p className="text-sm text-gray-600">
                        {projectCount === 0 ? 'No project ideas submitted' : 
                         projectCount === 1 ? 'Project idea submitted' : 
                         'Project ideas submitted'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/submit-idea')}
                      >
                        {projectCount === 0 ? 'Submit First Idea' : 'Submit New Idea'}
                      </Button>
                    </>
                  ) : (
                    // Other roles
                    <>
                      <p className="text-3xl font-bold text-blue-600">{projectCount}</p>
                      <p className="text-sm text-gray-600">
                        {projectCount === 0 ? 'No projects yet' : 
                         projectCount === 1 ? 'Project submitted' : 
                         'Projects submitted'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/project-ideas')}
                      >
                        View Projects
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Goal Widget */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                Weekly Goal
              </CardTitle>
              <CardDescription>
                Set and track your weekly career development goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.weekly_goal && !isEditingGoal ? (
                // Display saved goal
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Your Current Goal:</h4>
                    <p className="text-blue-800">{profile.weekly_goal}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingGoal(true)}
                      className="flex-1"
                    >
                      Edit Goal
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setWeeklyGoal('')
                        setIsEditingGoal(true)
                      }}
                    >
                      New Goal
                    </Button>
                  </div>
                </div>
              ) : (
                // Edit/Create goal form
                <div className="space-y-4">
                  <Textarea
                    placeholder="What do you want to achieve this week? (e.g., Complete 2 coding projects, Apply to 5 internships, Learn React...)"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveGoal} 
                      disabled={goalSaving || !weeklyGoal.trim()}
                      className="flex-1"
                    >
                      {goalSaving ? 'Saving...' : 'Save Goal'}
                    </Button>
                    {profile?.weekly_goal && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setWeeklyGoal(profile.weekly_goal)
                          setIsEditingGoal(false)
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    {weeklyGoal && (
                      <Button 
                        variant="outline" 
                        onClick={() => setWeeklyGoal('')}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">My Profile</CardTitle>
                <CardDescription>View and manage your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Update your personal information, skills, and bio.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/career-path')}>
              <CardHeader>
                <CardTitle className="text-xl text-green-600">Career Path</CardTitle>
                <CardDescription>Explore career opportunities and guidance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Get personalized career recommendations and explore different paths.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/project-ideas')}>
              <CardHeader>
                <CardTitle className="text-xl text-purple-600">Project Ideas</CardTitle>
                <CardDescription>Browse and submit project ideas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Find inspiration for your next project or share your ideas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/work-opportunities')}>
              <CardHeader>
                <CardTitle className="text-xl text-orange-600">Work Opportunities</CardTitle>
                <CardDescription>Find internships and job opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Discover internships, jobs, and freelance opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/interview-questions')}>
              <CardHeader>
                <CardTitle className="text-xl text-red-600">Interview Questions</CardTitle>
                <CardDescription>Practice with common interview questions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Prepare for interviews with curated questions and answers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/groups')}>
              <CardHeader>
                <CardTitle className="text-xl text-indigo-600">Groups</CardTitle>
                <CardDescription>Join study groups and communities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Connect with peers and join collaborative groups.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/feedback')}>
              <CardHeader>
                <CardTitle className="text-xl text-violet-600">User Feedback</CardTitle>
                <CardDescription>Provide feedback for the admins</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Admins are humans too! Let them know how they can improve the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/news')}>
              <CardHeader>
                <CardTitle className="text-xl text-green-800">News and Updates</CardTitle>
                <CardDescription>Stay informed about CS trends</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Get the latest news and updates in computer science.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthWrapper>
  )
}

export default DashAlt
