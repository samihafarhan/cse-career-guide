import { supabaseConfig } from '../db/supabase'

const API_URL = supabaseConfig.apiUrl
const API_KEY = supabaseConfig.key

export const dataExportService = {
  // GET user's complete profile data
  getUserProfileData: async (userId) => {
    const response = await fetch(`${API_URL}/profiles?userid=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  },

  // GET user's project data
  getUserProjectData: async (userId) => {
    const response = await fetch(`${API_URL}/projects?ownerid=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  },

  // GET user's activity data
  getUserActivityData: async (userId) => {
    const response = await fetch(`${API_URL}/analytics?userid=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  },

  // GET user's mentor project interests
  getUserMentorInterests: async (userId) => {
    const response = await fetch(`${API_URL}/mentorprojectinterests?studentid=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  },

  // GET user's bookmarks
  getUserBookmarks: async (userId) => {
    const response = await fetch(`${API_URL}/bookmarks?userid=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  },

  // GET complete user data for export (combines all above)
  getCompleteUserData: async (userId) => {
    try {
      const [profile, projects, activities, mentorInterests, bookmarks] = await Promise.all([
        dataExportService.getUserProfileData(userId),
        dataExportService.getUserProjectData(userId),
        dataExportService.getUserActivityData(userId),
        dataExportService.getUserMentorInterests(userId),
        dataExportService.getUserBookmarks(userId)
      ])

      return {
        profile: profile[0] || null,
        projects: projects || [],
        activities: activities || [],
        mentorInterests: mentorInterests || [],
        bookmarks: bookmarks || [],
        exportDate: new Date().toISOString(),
        dataPortability: {
          format: 'JSON',
          version: '1.0',
          userId: userId
        }
      }
    } catch (error) {
      throw new Error(`Failed to export user data: ${error.message}`)
    }
  }
}
