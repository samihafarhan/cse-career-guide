import { createClient } from '@supabase/supabase-js'
import { getUserProfile } from './profileService.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { getUserProfile }

/**
 * @returns {Promise<Array>}
 */
export const getAllProjectIdeas = async () => {
  const { data, error } = await supabase
    .from('beginner_project_ideas')
    .select('*')
    .order('title', { ascending: true })

  if (error) throw new Error(error.message)
  
  return data || []
}
