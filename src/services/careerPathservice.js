
import GeminiService from './geminiService'
import { createApiErrorHandler } from '../utils/errorHandler'
import supabase from '../db/supabase' 

const handleError = createApiErrorHandler('CareerPathService')


const generateCareerSuggestion = async (field, desiredSkills, confidentSkills) => {
  try {
    const prompt = `As a career advisor for Computer Science and Engineering students, provide a personalized career guidance based on the following information:

Field of Interest: ${field}
Desired Skills: ${desiredSkills}
Current Confident Skills: ${confidentSkills}

Please provide:
1. A specific career path recommendation
2. Key skills to focus on developing
3. Practical steps to achieve the goal
4. Relevant technologies or frameworks to learn

Keep the response concise but comprehensive, around 100-150 words.`

    const suggestion = await GeminiService.generateResponse(prompt)
    return suggestion
  } catch (error) {
    handleError(error, 'Failed to generate career suggestion')
  }
}

/**
 */
export const createCareerPath = async (careerData) => {
  try {
    console.log('Generating career path with Gemini...')
    

    const aiSuggestion = await generateCareerSuggestion(
      careerData.field,
      careerData.desired_skills,
      careerData.confident_skills
    )


    const { data, error } = await supabase
      .from('career_path')
      .insert([
        {
          user_id: careerData.user_id,
          field: careerData.field,
          desired_skills: careerData.desired_skills,
          confident_skills: careerData.confident_skills,
          suggestion: aiSuggestion
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }
    
    console.log('Career path saved to database:', data)
    return data

  } catch (error) {
    console.error('Database error:', error)
    handleError(error, 'Failed to create career path')
  }
}


export const getCareerPath = async (id) => {
  try {
    if (!id) {
      throw new Error("Career path ID is required")
    }

    const { data, error } = await supabase
      .from('career_path')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error("No career path found with this ID")
    }

    return data

  } catch (error) {
    console.error('Database error:', error)
    handleError(error, 'Failed to fetch career path')
  }
}


export const getAllCareerPaths = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    const { data, error } = await supabase
      .from('career_path')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Database error:', error)
    handleError(error, 'Failed to fetch career paths')
  }
}


export const updateCareerPath = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('career_path')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Database error:', error)
    handleError(error, 'Failed to update career path')
  }
}


export const deleteCareerPath = async (id) => {
  try {
    const { error } = await supabase
      .from('career_path')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return { message: "Career path deleted successfully" }
  } catch (error) {
    console.error('Database error:', error)
    handleError(error, 'Failed to delete career path')
  }
}

export default {
  createCareerPath,
  getCareerPath,
  getAllCareerPaths,
  updateCareerPath,
  deleteCareerPath,
}