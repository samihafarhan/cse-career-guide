import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Simple test components instead of Login/Signup
const SimpleLogin = () => <div>Simple Login Component</div>
const SimpleSignup = () => <div>Simple Signup Component</div>

const AuthSimpleTest = () => {
  const [searchParams] = useSearchParams()
  
  return (
    <div className="mt-36 flex flex-col items-center gap-10">
      <h1 className="text-5xl font-extrabold">
        {searchParams.get("createNew")?"Please login first":"Login/Signup"}
      </h1>
      <Tabs defaultValue="Login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Login">Login</TabsTrigger>
          <TabsTrigger value="Sign Up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="Login"><SimpleLogin/></TabsContent>
        <TabsContent value="Sign Up"><SimpleSignup/></TabsContent>
      </Tabs>
    </div>
  )
}

export default AuthSimpleTest
