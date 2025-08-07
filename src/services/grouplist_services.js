import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Fetch all groups from the group_desc table
 * @returns {Promise<Array>} Array of all groups
 */
export const getAllGroups = async () => {
  const { data, error } = await supabase
    .from('group_desc')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  
  return data || []
}

/**
 * Fetch groups that belong to a specific project
 * @param {string} projectId - The ID of the project
 * @returns {Promise<Array>} Array of groups for the specific project
 */
export const getGroupsByProjectId = async (projectId) => {
  const { data, error } = await supabase
    .from('group_desc')
    .select('*')
    .eq('project_id', projectId)
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

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  query = query.order('name', { ascending: true })

  const { data, error } = await query

  if (error) throw new Error(error.message)
  
  return data || []
}