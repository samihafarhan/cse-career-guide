import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BeatLoader } from 'react-spinners'
import Error from '../components/error'
import newsService from '../services/newsService'

const NewsPage = () => {
  // State for different news sections
  const [topHeadlines, setTopHeadlines] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [categorizedNews, setCategorizedNews] = useState([])
  const [newsSources, setNewsSources] = useState([])
  
  // Loading states
  const [headlinesLoading, setHeadlinesLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [categorizedLoading, setCategorizedLoading] = useState(true)
  const [sourcesLoading, setSourcesLoading] = useState(true)
  
  // Error states
  const [headlinesError, setHeadlinesError] = useState(null)
  const [searchError, setSearchError] = useState(null)
  const [categorizedError, setCategorizedError] = useState(null)
  const [sourcesError, setSourcesError] = useState(null)
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [selectedCategories, setSelectedCategories] = useState(['tech', 'business'])

  // Available categories
  const categories = ['general', 'tech', 'business', 'sports', 'entertainment', 'health', 'science']
  const multiCategories = ['tech', 'business', 'sports', 'entertainment', 'health', 'science']

  // Fetch top headlines
  const fetchTopHeadlines = async (category = 'general') => {
    try {
      setHeadlinesLoading(true)
      setHeadlinesError(null)
      const data = await newsService.getTopHeadlines(category, 10)
      setTopHeadlines(data)
    } catch (error) {
      setHeadlinesError(error)
    } finally {
      setHeadlinesLoading(false)
    }
  }

  // Search news
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setSearchLoading(true)
      setSearchError(null)
      const data = await newsService.searchNews(searchQuery, 10)
      setSearchResults(data)
    } catch (error) {
      setSearchError(error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Fetch categorized news
  const fetchCategorizedNews = async (categories) => {
    try {
      setCategorizedLoading(true)
      setCategorizedError(null)
      const data = await newsService.getNewsByCategories(categories, 15)
      setCategorizedNews(data)
    } catch (error) {
      setCategorizedError(error)
    } finally {
      setCategorizedLoading(false)
    }
  }

  // Fetch news sources
  const fetchNewsSources = async () => {
    try {
      setSourcesLoading(true)
      setSourcesError(null)
      const data = await newsService.getNewsSources()
      setNewsSources(data)
    } catch (error) {
      setSourcesError(error)
    } finally {
      setSourcesLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchTopHeadlines()
    fetchCategorizedNews(selectedCategories)
    fetchNewsSources()
  }, [])

  // Handle category change for headlines
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    fetchTopHeadlines(category)
  }

  // Handle multiple category selection
  const toggleCategorySelection = (category) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(newSelection)
    if (newSelection.length > 0) {
      fetchCategorizedNews(newSelection)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // News card component
  const NewsCard = ({ article, showSource = true }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">
          {article.title}
        </CardTitle>
        {showSource && article.source && (
          <CardDescription className="text-sm font-medium text-blue-600">
            {article.source}
          </CardDescription>
        )}
        <CardDescription className="text-xs text-gray-500">
          {article.published_at && formatDate(article.published_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {article.image_url && (
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-48 object-cover rounded-md"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <p className="text-gray-700 text-sm line-clamp-3">
          {article.description || article.snippet || 'No description available.'}
        </p>
        {article.url && (
          <Button 
            onClick={() => window.open(article.url, '_blank')}
            size="sm"
            className="w-full"
          >
            Read Full Article
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Latest News</h1>
      
      <Tabs defaultValue="headlines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="headlines">Top Headlines</TabsTrigger>
          <TabsTrigger value="search">Search News</TabsTrigger>
          <TabsTrigger value="categories">Multi-Category</TabsTrigger>
          <TabsTrigger value="sources">News Sources</TabsTrigger>
        </TabsList>

        {/* Top Headlines Tab */}
        <TabsContent value="headlines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Headlines by Category</CardTitle>
              <CardDescription>Get the latest news headlines by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
              
              {headlinesLoading && (
                <div className="flex items-center justify-center py-8">
                  <BeatLoader size={10} color="blue" />
                  <span className="ml-2">Loading headlines...</span>
                </div>
              )}
              
              {headlinesError && <Error message={headlinesError.message} />}
              
              {!headlinesLoading && !headlinesError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topHeadlines.length > 0 ? (
                    topHeadlines.map((article, index) => (
                      <NewsCard key={index} article={article} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No headlines found for this category.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search News Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search News Articles</CardTitle>
              <CardDescription>Search for news articles by keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter search query (e.g., 'artificial intelligence', 'climate change')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? <BeatLoader size={8} color="white" /> : 'Search'}
                </Button>
              </div>
              
              {searchError && <Error message={searchError.message} />}
              
              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((article, index) => (
                    <NewsCard key={index} article={article} />
                  ))}
                </div>
              )}
              
              {!searchLoading && searchResults.length === 0 && searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  No results found for "{searchQuery}". Try a different search term.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Category News Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>News by Multiple Categories</CardTitle>
              <CardDescription>Browse news from multiple categories simultaneously</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Select Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {multiCategories.map((category) => (
                    <Button
                      key={category}
                      onClick={() => toggleCategorySelection(category)}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      size="sm"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {selectedCategories.join(', ') || 'None'}
                </p>
              </div>
              
              {categorizedLoading && (
                <div className="flex items-center justify-center py-8">
                  <BeatLoader size={10} color="blue" />
                  <span className="ml-2">Loading categorized news...</span>
                </div>
              )}
              
              {categorizedError && <Error message={categorizedError.message} />}
              
              {!categorizedLoading && !categorizedError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedNews.length > 0 ? (
                    categorizedNews.map((article, index) => (
                      <NewsCard key={index} article={article} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No news found for selected categories.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* News Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available News Sources</CardTitle>
              <CardDescription>Browse available news sources and publications</CardDescription>
            </CardHeader>
            <CardContent>
              {sourcesLoading && (
                <div className="flex items-center justify-center py-8">
                  <BeatLoader size={10} color="blue" />
                  <span className="ml-2">Loading news sources...</span>
                </div>
              )}
              
              {sourcesError && <Error message={sourcesError.message} />}
              
              {!sourcesLoading && !sourcesError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newsSources.length > 0 ? (
                    newsSources.map((source, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{source.name}</CardTitle>
                          {source.url && (
                            <CardDescription className="text-sm">
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {source.url}
                              </a>
                            </CardDescription>
                          )}
                        </CardHeader>
                        {source.description && (
                          <CardContent>
                            <p className="text-sm text-gray-600">
                              {source.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No news sources available.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">API Testing Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Headlines:</strong> {topHeadlines.length} articles loaded</div>
            <div><strong>Search Results:</strong> {searchResults.length} articles</div>
            <div><strong>Categorized News:</strong> {categorizedNews.length} articles</div>
            <div><strong>News Sources:</strong> {newsSources.length} sources</div>
            <div><strong>Selected Category:</strong> {selectedCategory}</div>
            <div><strong>Selected Categories:</strong> {selectedCategories.join(', ')}</div>
            <div><strong>Search Query:</strong> {searchQuery || 'None'}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NewsPage
