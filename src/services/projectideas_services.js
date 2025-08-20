import { createClient } from '@supabase/supabase-js' //connects with db
import { getUserProfile } from './profileService.js' //retrieves user profile info

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { getUserProfile } //making it available for import in other files

/**
 * @returns {Promise<Array>}
 */
export const getAllProjectIdeas = async () => { //export makes this function usable in other files
  const { data, error }= await supabase
    .from('beginner_project_ideas')
    .select('*')
    .order('title', { ascending: true })

  if (error) throw new Error(error.message)
  
  return data || [] 
}

/**
 * Submit a new project idea (professors only)
 * @param {Object} ideaData - Project idea data object
 * @param {string} ideaData.title - Project title
 * @param {string} ideaData.description - Project description
 * @param {string} ideaData.submitted_by - Email of the professor (automatically set)
 * @returns {Promise<Object>} Created project idea data
 */
export const submitProjectIdea = async (ideaData) => {
  const { data, error } = await supabase
    .from('beginner_project_ideas')
    .insert([
      {
        title: ideaData.title,
        description: ideaData.description,
        submitted_by: ideaData.submitted_by
      }
    ])
    .select()
    .single() // Get the newly created project idea

  if (error) throw new Error(error.message)
  
  return data
}
