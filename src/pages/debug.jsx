import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import supabase from '../db/supabase'
import { useAuthCheck } from '@/context'
import AuthWrapper from '@/components/AuthWrapper'

const DebugPage = () => {
  const [debugInfo, setDebugInfo] = useState({
    auth: null,
    profile: null,
    permissions: null,
    storage: null,
    errors: []
  })
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuthCheck()

  const runDebugTests = async () => {
    setLoading(true)
    const errors = []
    const info = {
      auth: null,
      profile: null,
      permissions: null,
      storage: null,
      errors: []
    }

    try {
      // Test 1: Check authentication
      console.log('Testing authentication...')
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) {
        errors.push(`Auth Error: ${authError.message}`)
        info.auth = { status: 'error', error: authError.message }
      } else {
        info.auth = { 
          status: 'success', 
          user: authUser.user,
          userId: authUser.user?.id,
          email: authUser.user?.email
        }
      }

      // Test 2: Check profile access
      if (authUser.user?.id) {
        console.log('Testing profile access...')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.user.id)
          .single()

        if (profileError) {
          errors.push(`Profile Error: ${profileError.message}`)
          info.profile = { status: 'error', error: profileError.message }
          
          // Try to create profile
          console.log('Attempting to create profile...')
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authUser.user.id,
                email: authUser.user.email,
                role: 'user'
              }
            ])
            .select()
            .single()

          if (createError) {
            errors.push(`Profile Create Error: ${createError.message}`)
            info.profile = { 
              ...info.profile, 
              createError: createError.message,
              createStatus: 'failed'
            }
          } else {
            info.profile = { 
              status: 'created', 
              profile: newProfile,
              createStatus: 'success'
            }
          }
        } else {
          info.profile = { status: 'exists', profile }
        }
      }

      // Test 3: Check permissions for profile update
      if (authUser.user?.id) {
        console.log('Testing profile update permissions...')
        const { data: updateTest, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', authUser.user.id)
          .select()

        if (updateError) {
          errors.push(`Update Permission Error: ${updateError.message}`)
          info.permissions = { status: 'denied', error: updateError.message }
        } else {
          info.permissions = { status: 'allowed', result: updateTest }
        }
      }

      // Test 4: Check storage permissions with fallback method
      console.log('Testing storage permissions...')
      
      // Try the simple upload method which works with existing schema
      const { uploadVerificationDocumentWithFallback } = await import('../services/verificationServiceSimple')
      
      const testBlob = new Blob(['test'], { type: 'application/pdf' })
      const testFile = new File([testBlob], 'test.pdf', { type: 'application/pdf' })
      
      try {
        const uploadResult = await uploadVerificationDocumentWithFallback(testFile, authUser.user.id)
        info.storage = { 
          status: 'allowed', 
          method: uploadResult.method,
          result: uploadResult 
        }
        
        // Clean up if it was stored in storage
        if (uploadResult.method === 'storage') {
          await supabase.storage
            .from('verification-documents')
            .remove([uploadResult.path])
        }
      } catch (storageError) {
        errors.push(`Storage Error: ${storageError.message}`)
        info.storage = { status: 'denied', error: storageError.message }
      }

      info.errors = errors
      setDebugInfo(info)

    } catch (error) {
      console.error('Debug test error:', error)
      errors.push(`Unexpected Error: ${error.message}`)
      info.errors = errors
      setDebugInfo(info)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      runDebugTests()
    }
  }, [isAuthenticated])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'exists':
      case 'created':
      case 'allowed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
      case 'denied':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
      case 'exists':
      case 'created':
      case 'allowed':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
      case 'denied':
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to run debug tests.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Debug Dashboard</h1>
            <p className="text-gray-600">Diagnose authentication and permission issues</p>
          </div>
          <Button onClick={runDebugTests} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
        </div>

        {/* Authentication Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(debugInfo.auth?.status)}
              Authentication Test
              {getStatusBadge(debugInfo.auth?.status)}
            </CardTitle>
            <CardDescription>
              Verify user authentication status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo.auth ? (
              <div className="space-y-2">
                <p><strong>Status:</strong> {debugInfo.auth.status}</p>
                {debugInfo.auth.userId && <p><strong>User ID:</strong> {debugInfo.auth.userId}</p>}
                {debugInfo.auth.email && <p><strong>Email:</strong> {debugInfo.auth.email}</p>}
                {debugInfo.auth.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{debugInfo.auth.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p>No test results yet</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(debugInfo.profile?.status)}
              Profile Access Test
              {getStatusBadge(debugInfo.profile?.status)}
            </CardTitle>
            <CardDescription>
              Check profile table access and creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo.profile ? (
              <div className="space-y-2">
                <p><strong>Status:</strong> {debugInfo.profile.status}</p>
                {debugInfo.profile.profile && (
                  <div>
                    <p><strong>Profile Data:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(debugInfo.profile.profile, null, 2)}
                    </pre>
                  </div>
                )}
                {debugInfo.profile.createStatus && (
                  <p><strong>Create Status:</strong> {debugInfo.profile.createStatus}</p>
                )}
                {debugInfo.profile.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{debugInfo.profile.error}</AlertDescription>
                  </Alert>
                )}
                {debugInfo.profile.createError && (
                  <Alert variant="destructive">
                    <AlertDescription>Create Error: {debugInfo.profile.createError}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p>No test results yet</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(debugInfo.permissions?.status)}
              Update Permissions Test
              {getStatusBadge(debugInfo.permissions?.status)}
            </CardTitle>
            <CardDescription>
              Test profile update permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo.permissions ? (
              <div className="space-y-2">
                <p><strong>Status:</strong> {debugInfo.permissions.status}</p>
                {debugInfo.permissions.result && (
                  <p><strong>Update Result:</strong> Success</p>
                )}
                {debugInfo.permissions.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{debugInfo.permissions.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p>No test results yet</p>
            )}
          </CardContent>
        </Card>

        {/* Storage Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(debugInfo.storage?.status)}
              Storage Permissions Test
              {getStatusBadge(debugInfo.storage?.status)}
            </CardTitle>
            <CardDescription>
              Test file upload permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo.storage ? (
              <div className="space-y-2">
                <p><strong>Status:</strong> {debugInfo.storage.status}</p>
                {debugInfo.storage.method && <p><strong>Upload Method:</strong> {debugInfo.storage.method}</p>}
                {debugInfo.storage.path && <p><strong>Test File:</strong> {debugInfo.storage.path}</p>}
                {debugInfo.storage.result && (
                  <div>
                    <p><strong>Result Details:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(debugInfo.storage.result, null, 2)}
                    </pre>
                  </div>
                )}
                {debugInfo.storage.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{debugInfo.storage.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p>No test results yet</p>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {debugInfo.errors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Issues Found</CardTitle>
              <CardDescription>
                The following issues need to be resolved:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {debugInfo.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Recommended Solutions:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>If Storage fails:</strong> The system now uses automatic fallback to store documents as base64 in the profiles table</li>
                  <li>• <strong>For RLS policy issues:</strong> Run the SQL commands in the file <code>sql-fixes.sql</code> in your Supabase SQL Editor</li>
                  <li>• <strong>For missing profiles:</strong> The system will automatically create profiles when needed</li>
                  <li>• <strong>If you're an admin:</strong> Update your profile role to 'admin' in Supabase</li>
                  <li>• <strong>Still having issues?</strong> Try the enhanced verification system which handles RLS problems automatically</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthWrapper>
  )
}

export default DebugPage
