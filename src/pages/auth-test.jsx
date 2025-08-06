import React from 'react'
import { useSearchParams } from 'react-router-dom'

const AuthTest = () => {
  const [searchParams] = useSearchParams()
  
  return (
    <div className="mt-36 flex flex-col items-center gap-10">
      <h1 className="text-5xl font-extrabold">Test Auth Page</h1>
      <p>If you can see this, the basic routing works</p>
      <p>Search params: {searchParams.toString()}</p>
    </div>
  )
}

export default AuthTest
