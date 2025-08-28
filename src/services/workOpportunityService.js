import { createClient } from '@supabase/supabase-js'
import { getUserProfile } from './profileService.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { getUserProfile }

/**
 * Get all work opportunities
 * @returns {Promise<Array>} Array of work opportunities
 */
export const getAllWorkOpportunities = async () => {
  try {
    const { data, error } = await supabase
      .from('work_opportunities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        throw new Error('DATABASE_NOT_SETUP')
      }
      throw new Error(error.message)
    }
    
    return data || []
  } catch (error) {
    if (error.message === 'DATABASE_NOT_SETUP') {
      throw error
    }
    throw new Error('DATABASE_NOT_SETUP')
  }
}

/**
 * Get work opportunities by type (job or internship)
 * @param {string} type - The type to filter by ('job' or 'internship')
 * @returns {Promise<Array>} Array of work opportunities for the type
 */
export const getWorkOpportunitiesByType = async (type) => {
  try {
    const { data, error } = await supabase
      .from('work_opportunities')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        throw new Error('DATABASE_NOT_SETUP')
      }
      throw new Error(error.message)
    }
    
    return data || []
  } catch (error) {
    if (error.message === 'DATABASE_NOT_SETUP') {
      throw error
    }
    throw new Error('DATABASE_NOT_SETUP')
  }
}

/**
 * Submit a new work opportunity (professors and alumni only)
 * @param {Object} opportunityData - Work opportunity data
 * @param {string} opportunityData.title - The opportunity title
 * @param {string} opportunityData.type - Type ('job' or 'internship')
 * @param {string} opportunityData.salary_range - Salary range
 * @param {string} opportunityData.description - Short description
 * @param {string} opportunityData.apply_link - Link to company's application page
 * @param {string} opportunityData.submitted_by - Email of submitter (auto-set)
 * @returns {Promise<Object>} Created work opportunity
 */
export const submitWorkOpportunity = async (opportunityData) => {
  const { data, error } = await supabase
    .from('work_opportunities')
    .insert([
      {
        title: opportunityData.title,
        type: opportunityData.type,
        salary_range: opportunityData.salary_range,
        description: opportunityData.description,
        apply_link: opportunityData.apply_link,
        submitted_by: opportunityData.submitted_by
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  return data
}
