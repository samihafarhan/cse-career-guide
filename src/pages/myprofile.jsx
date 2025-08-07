import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
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
    const [testLoading, setTestLoading] = useState(false)
    const [realProfileData, setRealProfileData] = useState(null)

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

    // Test the real database function
    const testRealDatabase = async () => {
        setTestLoading(true)
        try {
            // Test with the known user ID from the database
            const realData = await getUserProfile("e9067bc0-50e3-47f3-8c90-af42c1666876")
            setRealProfileData(realData)
        } catch (error) {
            console.error('Error testing real database:', error)
            setRealProfileData({ error: error.message })
        } finally {
            setTestLoading(false)
        }
    }

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
                                    <label className="text-sm font-medium text-gray-500">User ID</label>
                                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">{displayUser.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm">{displayUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="text-sm">{new Date(displayUser.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Sign In</label>
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
                                    <label className="text-sm font-medium text-gray-500">Username</label>
                                    <p className="text-lg">{userProfile.username || 'Not available'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-lg">{userProfile.email || 'Not available'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Graduation Year</label>
                                    <p className="text-lg">{userProfile.grad_year || 'Not available'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Organization</label>
                                    <p className="text-lg">{userProfile.organization || 'Not available'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Position</label>
                                    <p className="text-lg">{userProfile.position || 'Not available'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Avatar URL</label>
                                    <p className="text-sm break-all">{userProfile.avatar_url || 'Not available'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Bio</label>
                                    <p className="text-lg mt-1">{userProfile.bio || 'Not available'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Skills</label>
                                    <p className="text-lg mt-1">{userProfile.skills || 'Not available'}</p>
                                </div>
                                {userProfile.pfp && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Profile Picture</label>
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
                                        <label className="text-sm font-medium text-gray-500">Profile Picture</label>
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

                {/* Database Testing Section */}
                <Card className="mt-6 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-lg">Database Function Test</CardTitle>
                        <CardDescription>Test the actual getUserProfile function with real database</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button 
                                onClick={testRealDatabase} 
                                disabled={testLoading}
                                className="w-full md:w-auto"
                            >
                                {testLoading ? <BeatLoader size={8} color="white" /> : "Test Real Database Function"}
                            </Button>
                            
                            {realProfileData && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Database Test Result</label>
                                    <pre className="text-xs bg-white p-3 rounded border overflow-auto mt-2">
                                        {JSON.stringify(realProfileData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default MyProfile
