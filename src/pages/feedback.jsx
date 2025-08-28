import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BeatLoader } from 'react-spinners'
import { getUserFeedback, getAllFeedback } from '../services/feedbackService'
import { useAuthCheck } from '@/context'

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()
  
  // Check if current user is admin (simplified inline check)
  const userIsAdmin = user?.role === 'admin'

  // Check for success message from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    if (urlParams.get('submitted') === 'true') {
      setShowSuccessMessage(true)
      navigate('/feedback', { replace: true })
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [location, navigate])

  // Fetch user's feedback or all feedback for admin
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!user?.email) return
      
      try {
        setLoading(true)
        setError(null)
        
        let data
        if (userIsAdmin) {
          // Admin can see all feedback
          data = await getAllFeedback()
        } else {
          // Regular users see only their feedback
          data = await getUserFeedback(user.email)
        }
        
        setFeedbackList(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      fetchFeedback()
    }
  }, [user, userIsAdmin])

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BeatLoader size={10} color="blue" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Success Message */}
      {showSuccessMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            ✅ Your feedback has been submitted successfully! Thank you for your valuable input.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {userIsAdmin ? 'All User Feedback (Admin View)' : 'My Feedback'}
              </CardTitle>
              <CardDescription>
                {userIsAdmin 
                  ? 'View and manage all feedback submitted by users across the platform'
                  : 'View and manage all your submitted feedback and suggestions'
                }
              </CardDescription>
            </div>
            {!userIsAdmin && (
              <Button onClick={() => navigate('/post-feedback')}>
                Submit New Feedback
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Error loading feedback: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Feedback List */}
      {!loading && !error && (
        <>
          {feedbackList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {userIsAdmin ? 'No Feedback Available' : 'No Feedback Submitted'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {userIsAdmin 
                      ? 'No users have submitted any feedback yet.'
                      : 'You haven\'t submitted any feedback yet. Share your thoughts and help us improve!'
                    }
                  </p>
                  {!userIsAdmin && (
                    <Button onClick={() => navigate('/post-feedback')}>
                      Submit Your First Feedback
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {userIsAdmin ? 'All Platform Feedback' : 'Your Feedback'}: {feedbackList.length}
                </h2>
                {userIsAdmin && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Admin View
                  </Badge>
                )}
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {feedbackList.map((feedback, index) => (
                  <AccordionItem
                    key={feedback.id}
                    value={`item-${feedback.id}`}
                    className="border border-gray-200 rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{feedbackList.length - index}
                          </Badge>
                          <span className="font-medium text-left">
                            {feedback.feedback_subject}
                          </span>
                          {userIsAdmin && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800">
                              by {feedback.email}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(feedback.created_at)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {feedback.feedback_desc}
                          </p>
                        </div>
                        <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                          <span>Submitted by: {feedback.email}</span>
                          <span>ID: {feedback.id}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Feedback
