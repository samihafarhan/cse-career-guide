import supabase from '../db/supabase'

/**
 * Submit feedback to the database
 * @param {Object} feedbackData 
 * @param {string} feedbackData.email 
 * @param {string} feedbackData.feedback_subject
 * @param {string} feedbackData.feedback_desc 
 * @returns {Promise<Object>} 
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single()

    if (error) {
      console.error('Error submitting feedback:', error)
      throw new Error(error.message || 'Failed to submit feedback')
    }

    return data
  } catch (error) {
    console.error('Error in submitFeedback:', error)
    throw new Error(error.message || 'Failed to submit feedback')
  }
}

/**
 * Get all feedback submitted by a specific user
 * @param {string} userEmail
 * @returns {Promise<Array>} 
 */
export const getUserFeedback = async (userEmail) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('email', userEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user feedback:', error)
      throw new Error(error.message || 'Failed to fetch feedback')
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserFeedback:', error)
    throw new Error(error.message || 'Failed to fetch feedback')
  }
}

/**
 * Get all feedback (for admin use)
 * @returns {Promise<Array>} 
 */
export const getAllFeedback = async () => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all feedback:', error)
      throw new Error(error.message || 'Failed to fetch feedback')
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllFeedback:', error)
    throw new Error(error.message || 'Failed to fetch feedback')
  }
}
