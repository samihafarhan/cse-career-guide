import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import adminAnalyticsService from '../services/adminanalysis.js'

const AdminAnalyticsDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const analyticsData = await adminAnalyticsService.getComprehensiveAnalytics()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700">Loading comprehensive analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-8xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Admin Control Center</h1>
            <p className="text-xl text-gray-600 mb-6">Comprehensive platform analytics and insights</p>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('overview')}
                className="px-6 py-3"
              >
                📊 Overview
              </Button>
              <Button 
                variant={activeTab === 'engagement' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('engagement')}
                className="px-6 py-3"
              >
                🎯 User Engagement
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Members</p>
                        <p className="text-3xl font-bold">{data?.overview?.totalUsers || 0}</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                        <span className="text-2xl">👥</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Career Paths</p>
                        <p className="text-3xl font-bold">{data?.overview?.totalCareerPaths || 0}</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                        <span className="text-2xl">🚀</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Total Questions</p>
                        <p className="text-3xl font-bold">{data?.overview?.totalQuestions || 0}</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                        <span className="text-2xl">❓</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Total Feedback</p>
                        <p className="text-3xl font-bold">{data?.overview?.totalFeedback || 0}</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                        <span className="text-2xl">💬</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100 text-sm font-medium">New Members (30d)</p>
                        <p className="text-3xl font-bold">{data?.newMembers || 0}</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                        <span className="text-2xl">✨</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* User Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* User Distribution by Role */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">👤 User Roles Distribution</CardTitle>
                    <CardDescription>Breakdown of user types on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.userRoleDistribution || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {(data?.userRoleDistribution || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* User Engagement Metrics */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">⚡ Platform Engagement</CardTitle>
                    <CardDescription>Key engagement indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Users with Career Paths</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {data?.engagement?.usersWithCareerPaths || 0}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {data?.engagement?.careerPathEngagementRate || 0}% of total users
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Active Feedback Contributors</span>
                          <span className="text-2xl font-bold text-green-600">
                            {data?.engagement?.feedbackContributors || 0}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Users who provided feedback
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Existing Group Number</span>
                          <span className="text-2xl font-bold text-purple-600">
                            {data?.engagement?.existingGroupNumber || 0}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Total groups in the platform
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Question Contributors</span>
                          <span className="text-2xl font-bold text-orange-600">
                            {data?.engagement?.questionContributors || 0}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Users who contributed questions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="mt-12 text-center">
            <Button 
              onClick={fetchData} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg"
            >
              🔄 Refresh Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalyticsDashboard