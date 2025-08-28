import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BeatLoader } from 'react-spinners'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadVerificationDocumentWithFallback, updateVerificationStatus } from '../services/verificationServiceSimple'
import { getUserProfile, getOrCreateUserProfile } from '../services/profileService'
import { fixUserProfileIssues } from '../services/databaseTestService'
import { useAuthCheck } from '@/context'
import AuthWrapper from '@/components/AuthWrapper'
import LoadingSpinner from '@/components/LoadingSpinner'

const Verification = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          // Try to get or create user profile
          const profile = await getOrCreateUserProfile(user.id, user.email)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching/creating user profile:', error)
          // If profile fetch fails, try to fix profile issues
          try {
            const fixResult = await fixUserProfileIssues(user.id, user.email)
            if (fixResult.success) {
              // Try to fetch profile again after fix
              const profile = await getUserProfile(user.id)
              setUserProfile(profile)
            } else {
              console.error('Failed to fix profile issues:', fixResult.errors)
            }
          } catch (fixError) {
            console.error('Error fixing profile issues:', fixError)
          }
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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    
    // Validate file
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        setErrors({ document: 'Only PDF files are allowed' })
        setSelectedFile(null)
        return
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ document: 'File size must be less than 10MB' })
        setSelectedFile(null)
        return
      }
      
      setSelectedFile(file)
      setErrors({})
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setErrors({ document: 'Please select a PDF file' })
      return
    }
    
    try {
      setLoading(true)
      setErrors({}) // Clear previous errors
      
      // Upload document using enhanced method with fallback
      console.log('Starting document upload...')
      const uploadResult = await uploadVerificationDocumentWithFallback(selectedFile, user.id)
      console.log('Upload result:', uploadResult)
      
      // Update user profile with verification status
      console.log('Updating verification status...')
      const profileResult = await updateVerificationStatus(user.id, uploadResult)
      console.log('Profile update result:', profileResult)
      
      setSubmitSuccess(true)
      
      // Navigate to success page after a delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
      
    } catch (error) {
      console.error('Submission error:', error)
      
      // Handle specific error types
      if (error.message.includes('row-level security policy')) {
        setErrors({ 
          submit: 'Permission denied. The upload was successful but profile update failed due to database permissions. Please check the browser console for details and contact support.' 
        })
      } else if (error.message.includes('Authentication error')) {
        setErrors({ 
          submit: 'Authentication error. Please log out and log back in, then try again.' 
        })
      } else if (error.message.includes('storage')) {
        setErrors({ 
          submit: 'File upload failed. Please check your file and try again.' 
        })
      } else {
        setErrors({ 
          submit: `Upload failed: ${error.message}. Please check the browser console for detailed error information.` 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (authLoading || userLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth')
    return null
  }

  // Check if user is already verified or pending
  if (userProfile?.verification_status === 'verified') {
    return (
      <AuthWrapper>
        <div className="container mx-auto p-6 max-w-2xl">
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-4">Already Verified</h2>
              <p className="text-gray-600 mb-4">
                Your account has already been verified. You have full access to all features.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthWrapper>
    )
  }

  if (userProfile?.verification_status === 'pending_review') {
    return (
      <AuthWrapper>
        <div className="container mx-auto p-6 max-w-2xl">
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-yellow-600 mb-4">Verification Pending</h2>
              <p className="text-gray-600 mb-4">
                Your verification document has been submitted and is currently under review. 
                You will be notified once the review is complete.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthWrapper>
    )
  }

  // Show success message
  if (submitSuccess) {
    return (
      <AuthWrapper>
        <div className="container mx-auto p-6 max-w-2xl">
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-4">Document Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your verification document has been uploaded and submitted for review. 
                You will be notified once the review is complete.
              </p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Account Verification
            </CardTitle>
            <CardDescription>
              Upload your verification document to get full access to the platform. 
              Only PDF files are accepted (max 10MB).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="document" className="block text-gray-700 mb-2">
                  Verification Document (PDF) *
                </Label>
                <div className="relative">
                  <Input
                    id="document"
                    name="document"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {errors.document && (
                  <p className="mt-1 text-sm text-red-600">{errors.document}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.submit}
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <BeatLoader size={8} color="white" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Submit for Verification'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  )
}

export default Verification
