import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * @param {string} userId 
 * @returns {Promise<Object>} 
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Handle case where user profile doesn't exist yet
  if (error && error.code === 'PGRST116') {
    return null // No profile found
  }
  
  if (error) throw new Error(error.message)
  
  return data
}

/**
 * Generic function to update any profile field
 * @param {string} userId - The user's ID
 * @param {Object} updates - Object with field-value pairs to update
 * @returns {Promise<Object>} Updated profile data
 */
export const updateProfileField = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  return data
}

/**
 * Update user's username in the profiles table
 * @param {string} userId - The user's ID
 * @param {string} username - The new username
 * @returns {Promise<Object>} Updated profile data
 */
export const updateUsername = async (userId, username) => {
  return updateProfileField(userId, { username })
}

/**
 * Check if a username already exists in the database
 * @param {string} username - The username to check
 * @param {string} currentUserId - The current user's ID (to exclude from check)
 * @returns {Promise<boolean>} True if username exists, false otherwise
 */
export const checkUsernameExists = async (username, currentUserId = null) => {
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .limit(1)

  // Exclude current user from the check
  if (currentUserId) {
    query = query.neq('id', currentUserId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  
  return data && data.length > 0
}

/**
 * Update user's organization in the profiles table
 * @param {string} userId - The user's ID
 * @param {string} organization - The new organization
 * @returns {Promise<Object>} Updated profile data
 */
export const updateOrganization = async (userId, organization) => {
  return updateProfileField(userId, { organization })
}

/**
 * Update user's bio in the profiles table
 * @param {string} userId - The user's ID
 * @param {string} bio - The new bio
 * @returns {Promise<Object>} Updated profile data
 */
export const updateBio = async (userId, bio) => {
  return updateProfileField(userId, { bio })
}

/**
 * Update user's graduation year in the profiles table
 * @param {string} userId - The user's ID
 * @param {number} gradYear - The new graduation year
 * @returns {Promise<Object>} Updated profile data
 */
export const updateGradYear = async (userId, gradYear) => {
  return updateProfileField(userId, { grad_year: gradYear })
}

/**
 * Update user's skills in the profiles table
 * @param {string} userId - The user's ID
 * @param {string} skills - The new skills
 * @returns {Promise<Object>} Updated profile data
 */
export const updateSkills = async (userId, skills) => {
  return updateProfileField(userId, { skills })
}

/**
 * Update user's role in the profiles table
 * @param {string} userId - The user's ID
 * @param {string} role - The new role
 * @returns {Promise<Object>} Updated profile data
 */
export const updateRole = async (userId, role) => {
  return updateProfileField(userId, { role })
}

/**
 * Update user's avatar URL in the profiles table
 * @param {string} userId - The user's ID
 * @param {string} avatarUrl - The new avatar URL
 * @returns {Promise<Object>} Updated profile data
 */
export const updateAvatarUrl = async (userId, avatarUrl) => {
  return updateProfileField(userId, { avatar_url: avatarUrl })
}