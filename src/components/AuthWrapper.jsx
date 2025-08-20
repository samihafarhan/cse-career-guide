import React from 'react'
import { BeatLoader } from 'react-spinners'
import { useAuthCheck } from '@/context'

const AuthWrapper = ({ children, customLoadingMessage = "Loading..." }) => {
  const { isAuthenticated, loading: authLoading } = useAuthCheck()

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <BeatLoader size={15} color="#3B82F6" />
          <p className="mt-4 text-gray-600">{customLoadingMessage}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}

export default AuthWrapper
