import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Login from '@/components/login'
import Signup from '@/components/signup'

const Auth = () => {
  const [searchParams]= useSearchParams()
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
        <TabsContent value="Login"><Login/></TabsContent>
        <TabsContent value="Sign Up"><Signup/></TabsContent>
      </Tabs>
    </div>
  )
}

export default Auth