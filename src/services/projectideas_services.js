import { createClient } from '@supabase/supabase-js'
import { getUserProfile } from './profileService.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export getUserProfile from profileService for convenience
export { getUserProfile }

/**
 * Fetches all project ideas from the beginner_project_ideas table
 * @returns {Promise<Array>} Array of project ideas
 */
export const getAllProjectIdeas = async () => {
  const { data, error } = await supabase
    .from('beginner_project_ideas')
    .select('*')
    .order('title', { ascending: true })

  if (error) throw new Error(error.message)
  
  return data || []
}
