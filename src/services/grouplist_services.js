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
export const getGroupsByProjectId = async (projectId) => {
  const { data, error } = await supabase
    .from('group_desc')
    .select('*') // Get all columns
    .eq('project_id', projectId) // WHERE project_id = ?
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  
  return data || []
}

/**
 * Fetch groups with project details
 * @param {string} projectId - Optional project ID to filter by
 * @returns {Promise<Array>} Array of groups with project information
 */
export const getGroupsWithProjectDetails = async (projectId = null) => {
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
 * @returns {Promise<Object>} Created group data
 */
export const createGroup = async (groupData) => {
  const { data, error } = await supabase
    .from('group_desc')
    .insert([
      {
        name: groupData.group_name, // Group name goes into the 'name' field
        project_id: groupData.project_id,
        introduction: groupData.introduction
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  return data
}