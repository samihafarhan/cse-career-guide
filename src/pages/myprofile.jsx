import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BeatLoader } from 'react-spinners'
import Error from '@/components/error'
import AuthWrapper from '@/components/AuthWrapper'
import LoadingSpinner from '@/components/LoadingSpinner'
import useFetch from '../hooks/use-fetch'
import useProfileUpdate from '../hooks/useProfileUpdate'
import { 
  getUserProfile, 
  updateUsername, 
  checkUsernameExists, 
  updateOrganization, 
  updateBio, 
  updateGradYear, 
  updateSkills,
  updateRole
} from '../services/profileService'
import { useAuthCheck } from '@/context'

const MyProfile = () => {
    const navigate = useNavigate()
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState(null)
    const [roleUpdateMessage, setRoleUpdateMessage] = useState(null)
    
    const { user } = useAuthCheck()

    // Use the useFetch hook for profile data
    const {data: userProfile, error, loading, fn: fetchProfile} = useFetch(getUserProfile)

    // Profile update hooks
    const usernameUpdate = useProfileUpdate(updateUsername, () => fetchProfile(user.id))
    const organizationUpdate = useProfileUpdate(updateOrganization, () => fetchProfile(user.id))
    const bioUpdate = useProfileUpdate(updateBio, () => fetchProfile(user.id))
    const gradYearUpdate = useProfileUpdate(updateGradYear, () => fetchProfile(user.id))
    const skillsUpdate = useProfileUpdate(updateSkills, () => fetchProfile(user.id))
    const roleUpdate = useProfileUpdate(updateRole, () => fetchProfile(user.id))

    // Fetch user profile data using the user ID from context
    useEffect(() => {
        if (user && user.id) {
            fetchProfile(user.id)
        }
    }, [user])

    // Debounced username availability check
    useEffect(() => {
        const checkUsername = async () => {
            if (!usernameUpdate.newValue.trim() || usernameUpdate.newValue.trim() === userProfile?.username || !user?.id) {
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
    }, [usernameUpdate.newValue, userProfile?.username, user?.id])

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading profile..." />
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Error message={error?.message} />
            </div>
        )
    }

    return (
        <AuthWrapper>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
                    
                    {/* Role Update Notification */}
                    {roleUpdateMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-5 h-5 text-green-400">
                                        ✓
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">
                                        {roleUpdateMessage}
                                    </p>
                                </div>
                                <div className="ml-auto pl-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setRoleUpdateMessage(null)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* User Authentication Info */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Authentication Details</CardTitle>
                            <CardDescription>{userProfile?.username || ''} Authentication Information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {user ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-500">User ID</Label>
                                        <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Email</Label>
                                        <p className="text-sm">{user.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Created At</Label>
                                        <p className="text-sm">{new Date(user.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Last Sign In</Label>
                                        <p className="text-sm">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No user data available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userProfile ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Username Section */}
                                    <div>
                                        <Label className="text-gray-500">Username</Label>
                                        <p className="text-lg">{userProfile?.username || 'Not available'}</p>
                                        
                                        <Dialog open={usernameUpdate.isDialogOpen} onOpenChange={(open) => open ? usernameUpdate.openDialog(userProfile?.username) : usernameUpdate.closeDialog()}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-2"
                                                    onClick={() => usernameUpdate.openDialog(userProfile?.username)}
                                                >
                                                    Edit Username
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Username</DialogTitle>
                                                    <DialogDescription>
                                                        Enter your new username below. This will be visible to other users.
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
                                                                <span className="ml-2">Updating...</span>
                                                            </>
                                                        ) : (
                                                            'Update Username'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Email Section (read-only from profile) */}
                                    <div>
                                        <Label className="text-gray-500">Email</Label>
                                        <p className="text-lg">{userProfile?.email || 'Not available'}</p>
                                    </div>

                                    {/* Graduation Year Section */}
                                    <div>
                                        <Label className="text-gray-500">Graduation Year</Label>
                                        <p className="text-lg">{userProfile?.grad_year || 'Not available'}</p>
                                        
                                        <Dialog open={gradYearUpdate.isDialogOpen} onOpenChange={(open) => open ? gradYearUpdate.openDialog(userProfile?.grad_year) : gradYearUpdate.closeDialog()}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-2"
                                                    onClick={() => gradYearUpdate.openDialog(userProfile?.grad_year)}
                                                >
                                                    Edit Graduation Year
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Graduation Year</DialogTitle>
                                                    <DialogDescription>
                                                        Enter your expected graduation year.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="gradYear">Graduation Year</Label>
                                                        <Input
                                                            id="gradYear"
                                                            type="number"
                                                            placeholder="e.g., 2024"
                                                            value={gradYearUpdate.newValue}
                                                            onChange={(e) => {
                                                                gradYearUpdate.setNewValue(e.target.value)
                                                                gradYearUpdate.setError(null)
                                                            }}
                                                            disabled={gradYearUpdate.isUpdating}
                                                        />
                                                    </div>
                                                    {gradYearUpdate.error && (
                                                        <div className="text-red-500 text-sm">
                                                            {gradYearUpdate.error}
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={gradYearUpdate.closeDialog}
                                                        disabled={gradYearUpdate.isUpdating}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            const year = parseInt(gradYearUpdate.newValue)
                                                            if (isNaN(year) || year < 1980 || year > 2100) {
                                                                gradYearUpdate.setError('Please enter a valid graduation year')
                                                                return
                                                            }
                                                            gradYearUpdate.handleUpdate(user.id, year, 'Graduation year')
                                                        }}
                                                        disabled={gradYearUpdate.isUpdating}
                                                    >
                                                        {gradYearUpdate.isUpdating ? (
                                                            <>
                                                                <BeatLoader size={8} color="white" />
                                                                <span className="ml-2">Updating...</span>
                                                            </>
                                                        ) : (
                                                            'Update Graduation Year'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Organization Section */}
                                    <div>
                                        <Label className="text-gray-500">Organization</Label>
                                        <p className="text-lg">{userProfile?.organization || 'Not available'}</p>
                                        
                                        <Dialog open={organizationUpdate.isDialogOpen} onOpenChange={(open) => open ? organizationUpdate.openDialog(userProfile?.organization) : organizationUpdate.closeDialog()}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-2"
                                                    onClick={() => organizationUpdate.openDialog(userProfile?.organization)}
                                                >
                                                    Edit Organization
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Organization</DialogTitle>
                                                    <DialogDescription>
                                                        Enter your current organization or university.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="organization">Organization</Label>
                                                        <Input
                                                            id="organization"
                                                            type="text"
                                                            placeholder="Enter your organization"
                                                            value={organizationUpdate.newValue}
                                                            onChange={(e) => {
                                                                organizationUpdate.setNewValue(e.target.value)
                                                                organizationUpdate.setError(null)
                                                            }}
                                                            disabled={organizationUpdate.isUpdating}
                                                        />
                                                    </div>
                                                    {organizationUpdate.error && (
                                                        <div className="text-red-500 text-sm">
                                                            {organizationUpdate.error}
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={organizationUpdate.closeDialog}
                                                        disabled={organizationUpdate.isUpdating}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => organizationUpdate.handleUpdate(user.id, organizationUpdate.newValue, 'Organization')}
                                                        disabled={organizationUpdate.isUpdating}
                                                    >
                                                        {organizationUpdate.isUpdating ? (
                                                            <>
                                                                <BeatLoader size={8} color="white" />
                                                                <span className="ml-2">Updating...</span>
                                                            </>
                                                        ) : (
                                                            'Update Organization'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Role Section */}
                                    <div>
                                        <Label className="text-gray-500">Role</Label>
                                        <p className="text-lg">{userProfile?.role || 'Not available'}</p>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="mt-2"
                                            onClick={() => navigate('/verifyRole')}
                                        >
                                            Verify Role
                                        </Button>
                                        
                                        {userProfile?.role?.toLowerCase() === 'student' && userProfile?.grad_year && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Graduation Year: {userProfile.grad_year} | Current Year: {new Date().getFullYear()}
                                                {userProfile.grad_year < new Date().getFullYear() && (
                                                    <span className="text-orange-600 ml-2">
                                                        • Will auto-upgrade to Alumni
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bio Section */}
                                    <div className="md:col-span-2">
                                        <Label className="text-gray-500">Bio</Label>
                                        <p className="text-lg">{userProfile?.bio || 'Not available'}</p>
                                        
                                        <Dialog open={bioUpdate.isDialogOpen} onOpenChange={(open) => open ? bioUpdate.openDialog(userProfile?.bio) : bioUpdate.closeDialog()}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-2"
                                                    onClick={() => bioUpdate.openDialog(userProfile?.bio)}
                                                >
                                                    Edit Bio
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Bio</DialogTitle>
                                                    <DialogDescription>
                                                        Tell others about yourself, your interests, and goals.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="bio">Bio</Label>
                                                        <Textarea
                                                            id="bio"
                                                            placeholder="Enter your bio"
                                                            value={bioUpdate.newValue}
                                                            onChange={(e) => {
                                                                bioUpdate.setNewValue(e.target.value)
                                                                bioUpdate.setError(null)
                                                            }}
                                                            disabled={bioUpdate.isUpdating}
                                                            rows={4}
                                                        />
                                                    </div>
                                                    {bioUpdate.error && (
                                                        <div className="text-red-500 text-sm">
                                                            {bioUpdate.error}
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={bioUpdate.closeDialog}
                                                        disabled={bioUpdate.isUpdating}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => bioUpdate.handleUpdate(user.id, bioUpdate.newValue, 'Bio')}
                                                        disabled={bioUpdate.isUpdating}
                                                    >
                                                        {bioUpdate.isUpdating ? (
                                                            <>
                                                                <BeatLoader size={8} color="white" />
                                                                <span className="ml-2">Updating...</span>
                                                            </>
                                                        ) : (
                                                            'Update Bio'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Skills Section */}
                                    <div className="md:col-span-2">
                                        <Label className="text-gray-500">Skills</Label>
                                        <p className="text-lg">{userProfile?.skills || 'Not available'}</p>
                                        
                                        <Dialog open={skillsUpdate.isDialogOpen} onOpenChange={(open) => open ? skillsUpdate.openDialog(userProfile?.skills) : skillsUpdate.closeDialog()}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-2"
                                                    onClick={() => skillsUpdate.openDialog(userProfile?.skills)}
                                                >
                                                    Edit Skills
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Skills</DialogTitle>
                                                    <DialogDescription>
                                                        List your technical skills, programming languages, frameworks, etc.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="skills">Skills</Label>
                                                        <Textarea
                                                            id="skills"
                                                            placeholder="e.g., JavaScript, React, Python, Node.js..."
                                                            value={skillsUpdate.newValue}
                                                            onChange={(e) => {
                                                                skillsUpdate.setNewValue(e.target.value)
                                                                skillsUpdate.setError(null)
                                                            }}
                                                            disabled={skillsUpdate.isUpdating}
                                                            rows={3}
                                                        />
                                                    </div>
                                                    {skillsUpdate.error && (
                                                        <div className="text-red-500 text-sm">
                                                            {skillsUpdate.error}
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={skillsUpdate.closeDialog}
                                                        disabled={skillsUpdate.isUpdating}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => skillsUpdate.handleUpdate(user.id, skillsUpdate.newValue, 'Skills')}
                                                        disabled={skillsUpdate.isUpdating}
                                                    >
                                                        {skillsUpdate.isUpdating ? (
                                                            <>
                                                                <BeatLoader size={8} color="white" />
                                                                <span className="ml-2">Updating...</span>
                                                            </>
                                                        ) : (
                                                            'Update Skills'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Profile Picture Display */}
                                    {userProfile?.pfp && (
                                        <div className="md:col-span-2">
                                            <Label className="text-gray-500">Profile Picture</Label>
                                            <img
                                                src={userProfile.pfp}
                                                alt="Profile"
                                                className="mt-2 w-32 h-32 object-cover rounded-full"
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">No profile data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthWrapper>
    )
}

export default MyProfile
