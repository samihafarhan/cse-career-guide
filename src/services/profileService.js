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
 * @param {string} userId 
 * @param {Object} updates
 * @returns {Promise<Object>}
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
 * @param {string} userId 
 * @param {string} username 
 * @returns {Promise<Object>} 
 */
export const updateUsername = async (userId, username) => {
  return updateProfileField(userId, { username })
}

/**
 * Check if a username already exists in the database
 * @param {string} username 
 * @param {string} currentUserId 
 * @returns {Promise<boolean>} 
 */
export const checkUsernameExists = async (username, currentUserId = null) => {
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .limit(1)

 
  if (currentUserId) {
    query = query.neq('id', currentUserId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  
  return data && data.length > 0
}

/**
 * Update user's organization in the profiles table
 * @param {string} userId 
 * @param {string} organization 
 * @returns {Promise<Object>}
 */
export const updateOrganization = async (userId, organization) => {
  return updateProfileField(userId, { organization })
}

/**
 * Update user's bio in the profiles table
 * @param {string} userId 
 * @param {string} bio 
 * @returns {Promise<Object>} 
 */
export const updateBio = async (userId, bio) => {
  return updateProfileField(userId, { bio })
}

/**
 * Update user's graduation year in the profiles table
 * Automatically updates role from student to alumni if graduation year < current year
 * @param {string} userId 
 * @param {number} gradYear 
 * @returns {Promise<Object>} 
 */
export const updateGradYear = async (userId, gradYear) => {
  const currentYear = new Date().getFullYear()
  
  // Get current user profile to check existing role
  const currentProfile = await getUserProfile(userId)
  
  const updates = { grad_year: gradYear }
  
  // Auto-update role from student to alumni if graduation year is before current year
  if (currentProfile?.role?.toLowerCase() === 'student' && gradYear < currentYear) {
    updates.role = 'alumni'
  }
  
  return updateProfileField(userId, updates)
}

/**
 * Update user's skills in the profiles table
 * @param {string} userId 
 * @param {string} skills 
 * @returns {Promise<Object>} 
 */
export const updateSkills = async (userId, skills) => {
  return updateProfileField(userId, { skills })
}

/**
 * Update user's role in the profiles table
 * @param {string} userId
 * @param {string} role 
 * @returns {Promise<Object>} 
 */
export const updateRole = async (userId, role) => {
  return updateProfileField(userId, { role })
}

/**
 * Create a new user profile
 * @param {string} userId 
 * @param {string} email 
 * @returns {Promise<Object>} 
 */
export const createUserProfile = async (userId, email) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: 'unverified',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    throw new Error(`Failed to create user profile: ${error.message}`)
  }
}

/**
 * Simple function to upgrade a student to alumni based on graduation year
 * @param {string} userId 
 * @returns {Promise<Object|null>} Updated profile if upgraded, null if no change needed
 */
export const upgradeStudentToAlumni = async (userId) => {
  try {
    const profile = await getUserProfile(userId)
    
    if (!profile) {
      return null
    }
    
    const currentYear = new Date().getFullYear()
    
    // Only upgrade if user is currently a student and has graduated
    if (profile.role?.toLowerCase() === 'student' && 
        profile.grad_year && 
        profile.grad_year <= currentYear) {
      
      const updatedProfile = await updateRole(userId, 'alumni')
      return { ...updatedProfile, wasUpgraded: true }
    }
    
    return null
  } catch (error) {
    console.error('Error upgrading student to alumni:', error)
    return null
  }
}

/**
 * Get or create user profile (ensures profile exists)
 * @param {string} userId 
 * @param {string} email 
 * @returns {Promise<Object>} 
 */
export const getOrCreateUserProfile = async (userId, email) => {
  try {
    // Try to get existing profile
    let profile = await getUserProfile(userId)
    
    // If profile doesn't exist, create it
    if (!profile) {
      profile = await createUserProfile(userId, email)
    }
    
    return profile
  } catch (error) {
    throw new Error(`Failed to get or create user profile: ${error.message}`)
  }
}

/**
 * Batch update all students to alumni if their graduation year <= current year
 * This function can be called periodically to auto-graduate students
 * @returns {Promise<Array>} Array of updated profiles
 */
export const updateStudentsToAlumni = async () => {
  try {
    const currentYear = new Date().getFullYear()
    
    // Get all students with graduation year <= current year
    const { data: studentsToUpdate, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .lte('grad_year', currentYear)
      .not('grad_year', 'is', null)
    
    if (fetchError) {
      throw new Error(fetchError.message)
    }
    
    if (!studentsToUpdate || studentsToUpdate.length === 0) {
      return []
    }
    
    // Update all qualifying students to alumni
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'alumni' })
      .eq('role', 'student')
      .lte('grad_year', currentYear)
      .not('grad_year', 'is', null)
      .select()
    
    if (updateError) {
      throw new Error(updateError.message)
    }
    
    return updatedProfiles || []
  } catch (error) {
    throw new Error(`Failed to batch update students to alumni: ${error.message}`)
  }
}

/**
 * Check and update a single user's role based on graduation year
 * @param {string} userId 
 * @returns {Promise<Object|null>} Updated profile if changed, null if no update needed
 */
export const checkAndUpdateUserRole = async (userId) => {
  try {
    const profile = await getUserProfile(userId)
    
    if (!profile) {
      return null
    }
    
    const currentYear = new Date().getFullYear()
    
    // Only update if user is currently a student and has graduated
    if (profile.role?.toLowerCase() === 'student' && 
        profile.grad_year && 
        profile.grad_year <= currentYear) {
      
      const updatedProfile = await updateRole(userId, 'alumni')
      return updatedProfile
    }
    
    return null
  } catch (error) {
    throw new Error(`Failed to check and update user role: ${error.message}`)
  }
}