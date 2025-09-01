import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get detailed information about a specific group
 * @param {string} groupId - ID of the group
 * @returns {Promise<Object>} Group details with project information
 */
export const getGroupDetails = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from('group_desc')
      .select(`
        *,
        beginner_project_ideas (
          id,
          title,
          description,
          submitted_by
        )
      `)
      .eq('id', groupId)
      .single()

    if (error) throw new Error(error.message)
    return data
  } catch (error) {
    throw new Error(`Failed to fetch group details: ${error.message}`)
  }
}

/**
 * Get all members of a group with their profile information and latest progress
 * @param {string} groupId - ID of the group
 * @returns {Promise<Array>} Array of group members with profile data
 */
export const getGroupMembers = async (groupId) => {
  try {
    // First get the group to access the members array
    const { data: group, error: groupError } = await supabase
      .from('group_desc')
      .select('members')
      .eq('id', groupId)
      .single()

    if (groupError) throw new Error(groupError.message)

    let members = group.members || []
    
    // Handle case where members might be stored as string
    if (typeof members === 'string') {
      try {
        members = JSON.parse(members)
      } catch (e) {
        members = []
      }
    }
    
    if (!Array.isArray(members) || members.length === 0) {
      return []
    }

    // Get member profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email, role')
      .in('id', members)

    if (profileError) throw new Error(profileError.message)

    return profiles || []
  } catch (error) {
    throw new Error(`Failed to fetch group members: ${error.message}`)
  }
}

/**
 * Get user's latest progress for a specific group
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the user
 * @returns {Promise<Object|null>} User's latest progress or null
 */
export const getUserProgress = async (groupId, userId) => {
  try {
    const { data, error } = await supabase
      .from('group_progress')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    // Return null if no progress found
    return null
  }
}

/**
 * Update or create user's progress for a group
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the user
 * @param {string} progress - Progress update text
 * @returns {Promise<Object>} Updated progress data
 */
export const updateUserProgress = async (groupId, userId, progress) => {
  try {
    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('group_progress')
      .upsert({
        group_id: groupId,
        user_id: userId,
        progress,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'group_id,user_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  } catch (error) {
    throw new Error(`Failed to update progress: ${error.message}`)
  }
}

/**
 * Get all progress updates for a group (for viewing progress history)
 * @param {string} groupId - ID of the group
 * @returns {Promise<Array>} Array of progress updates with user info
 */
export const getGroupProgressHistory = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from('group_progress')
      .select(`
        *,
        profiles (
          username,
          email
        )
      `)
      .eq('group_id', groupId)
      .order('updated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  } catch (error) {
    throw new Error(`Failed to fetch progress history: ${error.message}`)
  }
}
