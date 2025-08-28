import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BeatLoader } from 'react-spinners'
import { useAuthCheck } from '../context'
import AuthWrapper from '@/components/AuthWrapper'
import {
  getPendingVerificationsSimple as getPendingVerifications,
  getDocumentUrlSimple,
  approveVerificationSimple as approveVerification,
  rejectVerificationSimple as rejectVerification
} from '../services/verificationServiceSimple'

const DashboardAdmin = () => {
  console.log('DashboardAdmin component loading...')
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()
  console.log('Auth state:', { user, isAuthenticated, authLoading })
  
  // State for verification data
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingUser, setProcessingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')

  // Fetch pending verifications
  const fetchPendingVerifications = async () => {
    try {
      console.log('Fetching pending verifications...')
      setLoading(true)
      const users = await getPendingVerifications()
      console.log('Fetched users:', users)
      setPendingUsers(users)
    } catch (error) {
      console.error('Error fetching pending verifications:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingVerifications()
    }
  }, [isAuthenticated])

  // Handle viewing document
  const handleViewDocument = async (user) => {
    try {
      console.log('Viewing document for user:', user)
      console.log('Document path:', user.document_path)
      
      if (!user.document_path) {
        alert('No document found for this user')
        return
      }
      
      // Get document URL
      const documentUrl = await getDocumentUrlSimple(user.document_path, user)
      console.log('Generated document URL:', documentUrl)
      
      // Check if it's a base64 data URL
      if (documentUrl.startsWith('data:')) {
        // Create a blob from the base64 data for better handling
        const base64Data = documentUrl.split(',')[1]
        const binaryString = atob(base64Data) // Decode base64 to pdf binary str
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const blobUrl = URL.createObjectURL(blob)
        
        // Open the blob URL in a new tab
        const newWindow = window.open(blobUrl, '_blank')
        if (!newWindow) {
          alert('Please allow popups to view the document')
        }
        
        // Clean up the blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 60000) // 1 minute
      } else {
        // For storage URLs, open directly
        const newWindow = window.open(documentUrl, '_blank')
        if (!newWindow) {
          alert('Please allow popups to view the document')
        }
      }
    } catch (error) {
      console.error('Error viewing document:', error)
      alert('Failed to view document: ' + error.message)
    }
  }

  // Handle user rejection
  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) {
      return
    }

    try {
      console.log('Rejecting user:', userId)
      await rejectVerification(userId)
      
      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      
      alert('User rejected successfully!')
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user: ' + error.message)
    }
  }

  // Handle user approval
  const handleApprove = async (userId, role) => {
    if (!role) {
      alert('Please select a role before approving')
      return
    }
    
    if (!confirm(`Are you sure you want to approve this user as a ${role}?`)) {
      return
    }

    try {
      console.log('Approving user:', userId, 'as', role)
      setProcessingUser(userId)
      await approveVerification(userId, role)
      
      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      
      alert('User approved successfully!')
      setSelectedRole('') // Reset role selection
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user: ' + error.message)
    } finally {
      setProcessingUser(null)
    }
  }

  // Authentication loading
  if (authLoading) {
    return (
      <AuthWrapper>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-8">
            <BeatLoader size={10} color="blue" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <AuthWrapper>
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>
              You must be logged in to access the admin dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </AuthWrapper>
    )
  }

  // Show loading state for data
  if (loading) {
    return (
      <AuthWrapper>
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Verification Management</h1>
            <Card>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
                <CardDescription>Fetching verification data...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <BeatLoader size={10} color="blue" />
                  <span className="ml-2">Loading verification requests...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  // Show error state
  if (error) {
    return (
      <AuthWrapper>
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Verification Management</h1>
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load verification data: {error}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Verification Management</h1>
          
          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Found {pendingUsers.length} pending verification(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending verifications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((pendingUser) => (
                    <div key={pendingUser.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{pendingUser.username || pendingUser.email}</h3>
                          <p className="text-sm text-gray-600">Email: {pendingUser.email}</p>
                          <p className="text-sm text-gray-600">Status: {pendingUser.verification_status}</p>
                          <p className="text-sm text-gray-600">
                            Document: {pendingUser.document_path ? 'Available' : 'No document'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDocument(pendingUser)}
                          >
                            View Document
                          </Button>
                          
                          {/* Approve Dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={processingUser === pendingUser.id}
                              >
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve User Verification</DialogTitle>
                                <DialogDescription>
                                  Select a role for {pendingUser.username || pendingUser.email} and approve their verification.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="role" className="block text-sm font-medium mb-2">
                                    Select Role
                                  </label>
                                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="student">Student</SelectItem>
                                      <SelectItem value="alumni">Alumni</SelectItem>
                                      <SelectItem value="professor">Professor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setSelectedRole('')}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleApprove(pendingUser.id, selectedRole)}
                                  disabled={!selectedRole || processingUser === pendingUser.id}
                                >
                                  {processingUser === pendingUser.id ? (
                                    <>
                                      <BeatLoader size={8} color="white" />
                                      <span className="ml-2">Approving...</span>
                                    </>
                                  ) : (
                                    'Approve User'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(pendingUser.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthWrapper>
  )
}

export default DashboardAdmin
