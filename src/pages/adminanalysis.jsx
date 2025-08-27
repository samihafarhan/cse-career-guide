import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import adminAnalyticsService from '../services/adminanalysis.js'

const AdminAnalysis = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')

  useEffect(() => {
    fetchData()
  }, [timeframe])

  const fetchData = async () => {
    setLoading(true)
    try {
      const dashboardData = await adminAnalyticsService.getDashboardData()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Analytics Dashboard</h1>
            <p className="text-gray-600">Analysis of Login, Usage, and Popularity metrics</p>
            
            {/* Timeframe Selector */}
            <div className="mt-4 flex gap-2">
              <Button 
                variant={timeframe === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('7d')}
              >
                7 Days
              </Button>
              <Button 
                variant={timeframe === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('30d')}
              >
                30 Days
              </Button>
              <Button 
                variant={timeframe === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('90d')}
              >
                90 Days
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {data?.overview?.totalUsers || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  +{data?.login?.newUsersThisWeek || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Career Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {data?.overview?.totalProjects || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Total available paths
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Feedback Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {data?.overview?.totalFeedback || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  User feedback received
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Weekly Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {data?.overview?.growthThisWeek || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  New users this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Login Analytics */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">📊 Login Analytics</CardTitle>
                <CardDescription>User registration and login patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">{data?.login?.totalUsers || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">New This Week</p>
                      <p className="text-xl font-bold text-gray-700">{data?.login?.newUsersThisWeek || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">New This Month</p>
                      <p className="text-xl font-bold text-gray-700">{data?.login?.newUsersThisMonth || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 border-t">
                    <p className="text-sm text-gray-600">{data?.login?.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Analytics */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-green-600">📈 Usage Analytics</CardTitle>
                <CardDescription>Platform feature usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Career Paths</p>
                      <p className="text-2xl font-bold text-green-600">{data?.usage?.totalProjects || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Interview Questions</p>
                      <p className="text-xl font-bold text-gray-700">{data?.usage?.totalQuestions || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">User Feedback</p>
                      <p className="text-xl font-bold text-gray-700">{data?.usage?.totalFeedback || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 border-t">
                    <p className="text-sm text-gray-600">{data?.usage?.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popularity Analytics */}
            <Card className="bg-white border shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl text-purple-600">🔥 Popularity Analytics</CardTitle>
                <CardDescription>Most active users and trending content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Top Active Users</h3>
                    {data?.popularity?.topActiveUsers?.length > 0 ? (
                      data.popularity.topActiveUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <p className="font-medium">User {index + 1}</p>
                            <p className="text-sm text-gray-600">{user.activityCount} activities</p>
                          </div>
                          <div className="text-purple-600 font-bold">#{index + 1}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No active users data available
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Activity Summary</h3>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">Recent Activities</p>
                      <p className="text-2xl font-bold text-gray-700">{data?.popularity?.recentActivitiesCount || 0}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">Total Activities</p>
                      <p className="text-2xl font-bold text-gray-700">{data?.popularity?.totalActivities || 0}</p>
                    </div>

                    <div className="mt-4 p-4 border-t">
                      <p className="text-sm text-gray-600">{data?.popularity?.summary}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <Button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">
              🔄 Refresh Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalysis