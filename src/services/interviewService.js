import { createClient } from '@supabase/supabase-js'
import { getUserProfile } from './profileService.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { getUserProfile }

/**
 * Get all interview questions with their fields
 * @returns {Promise<Array>} Array of interview questions
 */
export const getAllInterviewQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('interview_questions')
      .select(`
        *,
        fields (
          id,
          name
        )
      `)
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
 * Get interview questions by field
 * @param {string} fieldId - The field ID to filter by
 * @returns {Promise<Array>} Array of interview questions for the field
 */
export const getInterviewQuestionsByField = async (fieldId) => {
  try {
    const { data, error } = await supabase
      .from('interview_questions')
      .select(`
        *,
        fields (
          id,
          name
        )
      `)
      .eq('field_id', fieldId)
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
 * Get all available fields
 * @returns {Promise<Array>} Array of fields
 */
export const getAllFields = async () => {
  try {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('name', { ascending: true })

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
 * Submit a new interview question (professors and alumni only)
 * @param {Object} questionData - Interview question data
 * @param {string} questionData.question - The interview question
 * @param {string} questionData.answer - The answer/explanation
 * @param {string} questionData.leetcode_link - Optional LeetCode link
 * @param {string} questionData.field_id - Field ID
 * @param {string} questionData.submitted_by - Email of submitter (auto-set)
 * @returns {Promise<Object>} Created interview question
 */
export const submitInterviewQuestion = async (questionData) => {
  const { data, error } = await supabase
    .from('interview_questions')
    .insert([
      {
        question: questionData.question,
        answer: questionData.answer,
        leetcode_link: questionData.leetcode_link,
        field_id: questionData.field_id,
        submitted_by: questionData.submitted_by
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  return data
}

/**
 * Create a new field (admin only)
 * @param {Object} fieldData - Field data
 * @param {string} fieldData.name - Field name
 * @param {string} fieldData.description - Field description
 * @returns {Promise<Object>} Created field
 */
export const createField = async (fieldData) => {
  const { data, error } = await supabase
    .from('fields')
    .insert([
      {
        name: fieldData.name,
        description: fieldData.description
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  return data
}
