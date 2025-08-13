import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { BeatLoader } from 'react-spinners'
import Error from '@/components/error'
import useFetch from '../hooks/use-fetch'
import { getCurrentUser } from '../db/apiAuth'
import { getUserProfile } from '../services/profileService'
import { UrlState } from '@/context'

const MyProfile = () => {
    const [currentUser, setCurrentUser] = useState(null)
    const [userLoading, setUserLoading] = useState(true)
    const [profileError, setProfileError] = useState(null)

    const { user } = UrlState()

    // Use the useFetch hook for profile data
    const {data: userProfile, error, loading, fn: fetchProfile} = useFetch(getUserProfile)

    // Fetch current user and then their profile
    useEffect(() => {
        const fetchUserAndProfile = async () => {
            try {
                setUserLoading(true)
                setProfileError(null)
                
                // Get current user
                const userData = await getCurrentUser()
                if (userData) {
                    setCurrentUser(userData)
                    // Fetch user profile data using the user ID
                    await fetchProfile(userData.id)
                } else {
                    setProfileError("No user logged in")
                }
            } catch (error) {
                setProfileError(error.message)
            } finally {
                setUserLoading(false)
            }
        }

        fetchUserAndProfile()
    }, [])

    // Alternative way using the context user if available
    useEffect(() => {
        if (user && !userProfile && !loading) {
            fetchProfile(user.id)
        }
    }, [user, userProfile, loading])

    if (userLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <BeatLoader size={15} color="blue" />
            </div>
        )
    }

    if (profileError && !error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Error message={profileError || error?.message} />
            </div>
        )
    }

    const displayUser = currentUser || user

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
                
                {/* User Authentication Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Authentication Details</CardTitle>
                        <CardDescription>Current user authentication information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {displayUser ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-500">User ID</Label>
                                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">{displayUser.id}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Email</Label>
                                    <p className="text-sm">{displayUser.email}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Created At</Label>
                                    <p className="text-sm">{new Date(displayUser.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Last Sign In</Label>
                                    <p className="text-sm">{displayUser.last_sign_in_at ? new Date(displayUser.last_sign_in_at).toLocaleString() : 'N/A'}</p>
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
                        <CardDescription>User profile data from the profiles table</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {userProfile ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-gray-500">Username</Label>
                                    <p className="text-lg">{userProfile.username || 'Not available'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Email</Label>
                                    <p className="text-lg">{userProfile.email || 'Not available'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Graduation Year</Label>
                                    <p className="text-lg">{userProfile.grad_year || 'Not available'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Organization</Label>
                                    <p className="text-lg">{userProfile.organization || 'Not available'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Role</Label>
                                    <p className="text-lg">{userProfile.role || 'Not available'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Avatar URL</Label>
                                    <p className="text-sm break-all">{userProfile.avatar_url || 'Not available'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-gray-500">Bio</Label>
                                    <p className="text-lg mt-1">{userProfile.bio || 'Not available'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-gray-500">Skills</Label>
                                    <p className="text-lg mt-1">{userProfile.skills || 'Not available'}</p>
                                </div>
                                {userProfile.pfp && (
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
                                {userProfile.avatar_url && !userProfile.pfp && (
                                    <div className="md:col-span-2">
                                        <Label className="text-gray-500">Profile Picture</Label>
                                        <img 
                                            src={userProfile.avatar_url} 
                                            alt="Profile" 
                                            className="mt-2 w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No profile data found for this user</p>
                                <p className="text-sm text-gray-400">
                                    User ID: {displayUser?.id || 'Unknown'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default MyProfile
