import React from 'react'
import { useNavigate } from 'react-router-dom'

const AdminDash = () => {
  const navigate = useNavigate()

  const navigateToPage = (path) => {
    navigate(path)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome Admin! Manage and oversee platform activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border" onClick={() => navigateToPage('/adminanalysis')}>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Analytics Dashboard</h3>
            <p className="text-sm text-gray-500 mb-3">Analysis of Login, Usage, Popularity</p>
            <p className="text-sm text-gray-600">
              View comprehensive analytics on user login patterns, platform usage statistics, and feature popularity metrics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border" onClick={() => navigateToPage('/validity')}>
            <h3 className="text-xl font-semibold text-green-600 mb-2">Role Verification</h3>
            <p className="text-sm text-gray-500 mb-3">Check validity of roles using ID card image</p>
            <p className="text-sm text-gray-600">
              Verify user roles and permissions by reviewing submitted ID card images and validating authenticity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border" onClick={() => navigateToPage('/safety')}>
            <h3 className="text-xl font-semibold text-purple-600 mb-2">Content Moderation</h3>
            <p className="text-sm text-gray-500 mb-3">Overseeing all creations and uploads</p>
            <p className="text-sm text-gray-600">
              Monitor and review all user-generated content including project teams, organizations, and articles for ethical compliance and safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDash