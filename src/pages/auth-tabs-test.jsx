import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AuthTabsTest = () => {
  const [searchParams] = useSearchParams()
  
  return (
    <div className="mt-36 flex flex-col items-center gap-10">
      <h1 className="text-5xl font-extrabold">Tabs Test</h1>
      <Tabs defaultValue="test1" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test1">Test 1</TabsTrigger>
          <TabsTrigger value="test2">Test 2</TabsTrigger>
        </TabsList>
        <TabsContent value="test1">
          <div>Tab 1 Content</div>
        </TabsContent>
        <TabsContent value="test2">
          <div>Tab 2 Content</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AuthTabsTest
