import { supabaseConfig } from '../db/supabase'

const API_URL = supabaseConfig.apiUrl
const API_KEY = supabaseConfig.key

export const profileService = {
  // GET all profiles
  getAllProfiles: async () => {
    const response = await fetch(`${API_URL}/profiles`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  },

  // POST create profile
  createProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })
    return response.json()
  },

  // PATCH update profile
  updateProfile: async (id, profileData) => {
    const response = await fetch(`${API_URL}/profiles?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })
    return response.json()
  },

  // DELETE profile
  deleteProfile: async (id) => {
    const response = await fetch(`${API_URL}/profiles?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }
}
