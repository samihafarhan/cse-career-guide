import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import AuthWrapper from '@/components/AuthWrapper'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuthCheck } from '@/context'

const Dash = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuthCheck()

  const navigateToPage = (path) => {
    navigate(path)
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to your Dashboard</h1>
          <p className="text-gray-600">
            {user?.email ? `Hello, ${user.email}!` : 'Hello!'} Explore the features available to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/profile')}>
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/project-ideas')}>
            <CardHeader>
              <CardTitle className="text-xl text-green-600">Project Ideas</CardTitle>
              <CardDescription>Explore beginner-friendly projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Discover project ideas and find groups to collaborate with.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/groups')}>
            <CardHeader>
              <CardTitle className="text-xl text-purple-600">Groups</CardTitle>
              <CardDescription>Join or create study groups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Connect with other students and work on projects together.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/career-path')}>
            <CardHeader>
              <CardTitle className="text-xl text-indigo-600">Career Path</CardTitle>
              <CardDescription>See which path you are best suited for</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Discover your ideal career path based on your skills and interests.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/news')}>
            <CardHeader>
              <CardTitle className="text-xl text-orange-600">News & Updates</CardTitle>
              <CardDescription>Stay informed about CS trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get the latest news and updates in computer science.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/interview-questions')}>
            <CardHeader>
              <CardTitle className="text-xl text-indigo-600">Interview Questions</CardTitle>
              <CardDescription>Prepare for technical interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Practice with curated interview questions and solutions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AuthWrapper>
  )
}

export default Dash