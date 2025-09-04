import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import MarkdownRenderer from '@/components/ui/markdown'
import { Plus, ExternalLink, Code, Users } from 'lucide-react'
import { getAllInterviewQuestions, getInterviewQuestionsByField, getAllFields, getUserProfile } from '../services/interviewService'
import { useAuthCheck } from '@/context'

const InterviewQuestions = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck()
  
  const [questions, setQuestions] = useState([])
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(searchParams.get('field') || 'all')
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

  // Fetch fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fieldsData = await getAllFields()
        setFields(fieldsData)
      } catch (error) {
        console.error('Error fetching fields:', error)
        setFields([])
      }
    }

    if (isAuthenticated) {
      fetchFields()
    }
  }, [isAuthenticated])

  // Fetch questions based on selected field
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoading(true)
        setError(null)
        
        let questionsData
        if (selectedField === 'all') {
          questionsData = await getAllInterviewQuestions()
        } else {
          questionsData = await getInterviewQuestionsByField(selectedField)
        }
        
        setQuestions(questionsData)
      } catch (error) {
        console.error('Error fetching questions:', error)
        setQuestions([])
        
        if (error.message === 'DATABASE_NOT_SETUP') {
          setError('Interview questions database not set up yet. Please create the required database tables first.')
        } else {
          setError(`Error loading interview questions: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [selectedField, isAuthenticated])

  // Check if user can submit questions (professor or alumni)
  const canSubmitQuestions = () => {
    if (!userProfile) return false
    const role = userProfile.role?.toLowerCase()
    return role === 'professor' || role === 'alumni'
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Handle field change
  const handleFieldChange = (fieldId) => {
    setSelectedField(fieldId)
    const params = new URLSearchParams(searchParams)
    if (fieldId === 'all') {
      params.delete('field')
    } else {
      params.set('field', fieldId)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Questions</h1>
          <p className="text-gray-600">Practice with curated technical interview questions</p>
        </div>
            
        {canSubmitQuestions() && (
          <Button 
            onClick={() => navigate('/submit-interview-question')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Submit Question
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by field:</span>
          <Select value={selectedField} onValueChange={handleFieldChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              {fields.map((field) => (
                <SelectItem key={field.id} value={String(field.id)}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{questions.length} questions available</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Skeleton className="h-6 w-6 rounded-full" />
          <span className="ml-2">Loading questions...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Questions List */}
      {!loading && !error && questions.length === 0 && (
        <div className="text-center py-12">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600 mb-4">
            {selectedField === 'all' 
              ? 'No interview questions have been submitted yet.' 
              : 'No questions found for the selected field.'}
          </p>
          {canSubmitQuestions() && (
            <Button onClick={() => navigate('/submit-interview-question')}>
              Submit the first question
            </Button>
          )}
        </div>
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-xl">{question.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {question.difficulty && (
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    )}
                    {question.fields && (
                      <Badge variant="outline">
                        {question.fields.name}
                      </Badge>
                    )}
                  </div>
                </div>
                {question.submitted_by && (
                  <CardDescription>
                    Submitted by {question.submitted_by}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="question" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="question">Question</TabsTrigger>
                    <TabsTrigger value="answer">Answer</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="question" className="mt-4">
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer>{question.question}</MarkdownRenderer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="answer" className="mt-4">
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer>{question.answer}</MarkdownRenderer>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* LeetCode or external link if available */}
                {question.leetcode_link && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(question.leetcode_link, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
    </div>
  )
}

export default InterviewQuestions
