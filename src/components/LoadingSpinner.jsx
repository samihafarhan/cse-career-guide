import React from 'react'
import { BeatLoader } from 'react-spinners'

const LoadingSpinner = ({ 
  size = 15, 
  color = "#3B82F6", 
  message = "Loading...", 
  fullScreen = false,
  className = ""
}) => {
  const containerClass = fullScreen 
    ? "flex justify-center items-center min-h-screen" 
    : "flex justify-center items-center py-8"

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <BeatLoader size={size} color={color} />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  )
}

export default LoadingSpinner
