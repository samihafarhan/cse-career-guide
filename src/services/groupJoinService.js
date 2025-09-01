import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Send a join request for a group (store in group_desc pending_requests)
 * @param {string} groupId - ID of the group to join
 * @param {string} requesterId - ID of the user requesting to join
 * @returns {Promise<Object>} Updated group
 */
export const sendJoinRequest = async (groupId, requesterId) => {
  try {
    // Get current group data
    const { data: group, error: fetchError } = await supabase
      .from('group_desc')
      .select('pending_requests')
      .eq('id', groupId)
      .single()

    if (fetchError) {
      // Check if error is due to missing column
      if (fetchError.message.includes('pending_requests') || fetchError.message.includes('column') || fetchError.code === '42703') {
        throw new Error('Database setup incomplete. Please run the SQL command to add pending_requests column. Check SETUP_GROUP_REQUESTS.md for instructions.')
      }
      throw new Error(fetchError.message)
    }

    const currentRequests = group.pending_requests || []
    
    // Check if user already requested
    if (currentRequests.includes(requesterId)) {
      throw new Error('You have already requested to join this group')
    }

    const updatedRequests = [...currentRequests, requesterId]

    const { data, error } = await supabase
      .from('group_desc')
      .update({ pending_requests: updatedRequests })
      .eq('id', groupId)
      .select()
      .single()

    if (error) {
      if (error.message.includes('pending_requests') || error.message.includes('column') || error.code === '42703') {
        throw new Error('Database setup incomplete. Please run: ALTER TABLE group_desc ADD COLUMN IF NOT EXISTS pending_requests TEXT[];')
      }
      throw new Error(error.message)
    }
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * Get join requests for a specific group
 * @param {string} groupId - ID of the group
 * @returns {Promise<Array>} Array of pending requests with user info
 */
export const getGroupJoinRequests = async (groupId) => {
  try {
    const { data: group, error } = await supabase
      .from('group_desc')
      .select('pending_requests')
      .eq('id', groupId)
      .single()

    if (error) throw new Error(error.message)

    const pendingRequests = group.pending_requests || []
    
    if (pendingRequests.length === 0) {
      return []
    }

    // Get user profiles for pending requests with detailed info
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email, role')
      .in('id', pendingRequests)

    if (profileError) throw new Error(profileError.message)

    return profiles || []
  } catch (error) {
    console.warn('Error getting join requests:', error.message)
    return []
  }
}

/**
 * Approve a join request (move from pending_requests to members)
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the user to approve
 * @returns {Promise<Object>} Updated group
 */
export const approveJoinRequest = async (groupId, userId) => {
  try {
    // Get current group data
    const { data: group, error: fetchError } = await supabase
      .from('group_desc')
      .select('pending_requests, members')
      .eq('id', groupId)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    const currentRequests = group.pending_requests || []
    const currentMembers = group.members || []

    // Remove from pending requests and add to members
    const updatedRequests = currentRequests.filter(id => id !== userId)
    const updatedMembers = [...currentMembers, userId]

    const { data, error } = await supabase
      .from('group_desc')
      .update({ 
        pending_requests: updatedRequests,
        members: updatedMembers 
      })
      .eq('id', groupId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * Reject a join request (remove from pending_requests)
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the user to reject
 * @returns {Promise<Object>} Updated group
 */
export const rejectJoinRequest = async (groupId, userId) => {
  try {
    // Get current group data
    const { data: group, error: fetchError } = await supabase
      .from('group_desc')
      .select('pending_requests')
      .eq('id', groupId)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    const currentRequests = group.pending_requests || []
    const updatedRequests = currentRequests.filter(id => id !== userId)

    const { data, error } = await supabase
      .from('group_desc')
      .update({ pending_requests: updatedRequests })
      .eq('id', groupId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * Check if user has already requested to join a group
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the user
 * @returns {Promise<boolean>} True if user has pending request
 */
export const hasExistingJoinRequest = async (groupId, userId) => {
  try {
    const { data: group, error } = await supabase
      .from('group_desc')
      .select('pending_requests')
      .eq('id', groupId)
      .single()

    if (error) throw new Error(error.message)

    const pendingRequests = group.pending_requests || []
    return pendingRequests.includes(userId)
  } catch (error) {
    console.warn('Error checking existing request:', error.message)
    return false
  }
}

/**
 * Check if user is already a member of a group
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the user
 * @returns {Promise<boolean>} True if user is a member
 */
export const isGroupMember = async (groupId, userId) => {
  try {
    const { data: group, error } = await supabase
      .from('group_desc')
      .select('members, created_by')
      .eq('id', groupId)
      .single()

    if (error) throw new Error(error.message)

    // Check if user is creator or member
    return group.created_by === userId || (group.members && group.members.includes(userId))
  } catch (error) {
    console.warn('Error checking membership:', error.message)
    return false
  }
}
