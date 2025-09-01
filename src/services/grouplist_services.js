import { createClient } from '@supabase/supabase-js' // Importing Supabase client to interact with the database

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey) //actual connection to Supabase project

/**
 * Fetch all groups from the group_desc table
 * @returns {Promise<Array>} Array of all groups
 */
export const getAllGroups = async () => { //exports an asynchronous function named getAllGroups
  const { data, error } = await supabase // await pauses the function til supabase responds
    .from('group_desc')
    .select('*') // Get all columns
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  
  return data || [] // Return data or an empty array if no data found
}

/**
 * Fetch groups that belong to a specific project
 * @param {string} projectId - The ID of the project
 * @returns {Promise<Array>} Array of groups for the specific project
 */
export const getGroupsByProjectId = async (projectId) => {  //fetch from db
  const { data, error } = await supabase
    .from('group_desc')
    .select('*') // Get all columns
    .eq('project_id', projectId) 
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  return data || [] // Return an empty array if no data found
}

/**
 * Fetch groups with project details
 * @param {string} projectId - Optional project ID to filter by
 * @returns {Promise<Array>} Array of groups with project information
 */
export const getGroupsWithProjectDetails = async (projectId = null) => {
  let query = supabase // Initialize query variable with Supabase client
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
//use it to either get every single group in the system or just the groups for one specific project by project_id
  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  query = query.order('name', { ascending: true })

  const { data, error } = await query

  if (error) throw new Error(error.message)
  
  return data || []
}

/**
 * Create a new group
 * @param {Object} groupData - Group data object
 * @param {string} groupData.group_name - Name of the group
 * @param {string} groupData.introduction - Group introduction
 * @param {string} groupData.project_id - ID of the associated project
 * @param {string} groupData.created_by - ID of the user creating the group
 * @returns {Promise<Object>} Created group data
 */
export const createGroup = async (groupData) => { //groupdata is an obj with data to create new group
  // First, fetch the creator's email from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', groupData.created_by)
    .single()

  if (profileError) {
    console.error('Error fetching creator profile:', profileError)
  }

  const { data, error } = await supabase
    .from('group_desc')
    .insert([
      {
        name: groupData.group_name, // Group name goes into the 'name' field
        project_id: groupData.project_id,
        introduction: groupData.introduction,
        created_by: groupData.created_by,
        members: [groupData.created_by], // Initialize with creator as first member
        email: profile?.email || null // Store creator's email for future use
      }
    ])
    .select() 
    .single() // Get the newly created group

  if (error) throw new Error(error.message)
  
  return data
}

/**
 * Fetch groups with project details and join request counts
 * @param {string} projectId - Optional project ID to filter by
 * @param {string} userId - Current user ID to check membership and requests
 * @returns {Promise<Array>} Array of groups with project information and join request counts
 */
export const getGroupsWithDetails = async (projectId = null, userId = null) => {
  // First, let's try a direct query that works with the current schema
  let query = supabase
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

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  query = query.order('name', { ascending: true })

  const { data: groups, error } = await query

  if (error) throw new Error(error.message)
  
  // If no user ID provided, return groups without join request info
  if (!userId) {
    return groups || []
  }

  // Now fetch creator emails separately for groups that have created_by
  const groupsWithCreatorEmails = await Promise.all(
    (groups || []).map(async (group) => {
      let creatorEmail = group.email || null // Use email column if available
      
      // If no email in group table but has created_by, fetch from profiles
      if (!creatorEmail && group.created_by) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', group.created_by)
            .single()
          
          creatorEmail = profile?.email || null
        } catch (error) {
          console.error(`Error fetching creator email for group ${group.id}:`, error)
        }
      }
      
      return {
        ...group,
        creator_email: creatorEmail
      }
    })
  )

  // Process groups to add user-specific information
  const groupsWithDetails = groupsWithCreatorEmails.map(group => {
    // Ensure arrays are properly parsed if they come as strings
    let pendingRequests = group.pending_requests || []
    let members = group.members || []
    
    // Handle case where arrays might be stored as strings
    if (typeof pendingRequests === 'string') {
      try {
        pendingRequests = JSON.parse(pendingRequests)
      } catch (e) {
        pendingRequests = []
      }
    }
    
    if (typeof members === 'string') {
      try {
        members = JSON.parse(members)
      } catch (e) {
        members = []
      }
    }
    
    // Ensure they are arrays
    pendingRequests = Array.isArray(pendingRequests) ? pendingRequests : []
    members = Array.isArray(members) ? members : []
    
    return {
      ...group,
      members, // Use parsed members
      pending_requests: pendingRequests, // Use parsed pending_requests
      pending_requests_count: pendingRequests.length,
      user_has_requested: pendingRequests.includes(userId),
      is_member: members.includes(userId),
      is_creator: group.created_by === userId,
      can_join: !members.includes(userId) && 
                !pendingRequests.includes(userId) && 
                group.created_by !== userId
    }
  })

  return groupsWithDetails
}

/**
 * Get the count of groups a user is a member of (optimized version)
 * @param {string} userId - The user ID to check
 * @returns {Promise<number>} Number of groups the user is a member of
 */
export const getUserProjectParticipationCount = async (userId) => {
  if (!userId) return 0

  try {
    // Use client-side filtering for reliability
    const { data: allGroups, error } = await supabase
      .from('group_desc')
      .select('*')

    if (error) throw new Error(error.message)

    if (!allGroups) return 0

    let participationCount = 0
    
    allGroups.forEach(group => {
      let members = group.members || []
      
      if (typeof members === 'string') {
        try {
          members = JSON.parse(members)
        } catch {
          members = []
        }
      }
      
      members = Array.isArray(members) ? members : []
      
      if (members.includes(userId)) {
        participationCount++
      }
    })

    return participationCount
  } catch (error) {
    console.error('Error getting user project participation count:', error)
    return 0
  }
}