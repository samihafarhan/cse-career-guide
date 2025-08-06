import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Updates the bio for a user's profile
 * @param {string} userId - The user's ID
 * @param {string} bio - The bio text to update
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const updateUserBio = async (userId, bio) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ bio: bio })
      .eq('id', userId)
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating bio:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Updates the skills for a user's profile
 * @param {string} userId - The user's ID
 * @param {string} skills - The skills text to update
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const updateUserSkills = async (userId, skills) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ skills: skills })
      .eq('id', userId)
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating skills:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Gets the current user's profile
 * @param {string} userId - The user's ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Updates multiple profile fields at once
 * @param {string} userId - The user's ID
 * @param {Object} profileData - Object containing profile fields to update
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
}
