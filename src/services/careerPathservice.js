// services/careerPathservice.js - Direct Gemini Implementation
import GeminiService from './geminiService'

// In-memory storage for this session
let careerPathStorage = {}

/**
 * Generate career suggestion using Gemini AI
 */
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
    console.error('Error generating career suggestion:', error)
    throw new Error(`Failed to generate career suggestion: ${error.message}`)
  }
}

/**
 * Create a new career path entry (Direct Gemini, no database)
 */
export const createCareerPath = async (careerData) => {
  try {
    console.log('Generating career path with Gemini...')
    
    // Generate AI suggestion directly
    const aiSuggestion = await generateCareerSuggestion(
      careerData.field,
      careerData.desired_skills,
      careerData.confident_skills
    )

    // Create result object
    const result = {
      id: careerData.user_id,
      user_id: careerData.user_id,
      field: careerData.field,
      desired_skills: careerData.desired_skills,
      confident_skills: careerData.confident_skills,
      suggestion: aiSuggestion,
      created_at: new Date().toISOString()
    }

    // Store in memory
    careerPathStorage[careerData.user_id] = result
    
    console.log('Career path generated successfully:', result)
    return result

  } catch (error) {
    console.error("Error creating career path:", error)
    throw new Error(`Failed to create career path: ${error.message}`)
  }
}

/**
 * Get career path data for a specific user
 */
export const getCareerPath = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    // Get from memory
    const data = careerPathStorage[userId]
    if (data) {
      return data
    }

    throw new Error("No career path found for this user")

  } catch (error) {
    console.error("Error fetching career path:", error)
    throw new Error(`Failed to fetch career path: ${error.message}`)
  }
}

/**
 * Update an existing career path entry
 */
export const updateCareerPath = async (userId, updateData) => {
  try {
    const existing = await getCareerPath(userId)
    const updated = { ...existing, ...updateData, updated_at: new Date().toISOString() }
    
    careerPathStorage[userId] = updated
    return updated
  } catch (error) {
    console.error("Error updating career path:", error)
    throw new Error(`Failed to update career path: ${error.message}`)
  }
}

/**
 * Delete a career path entry
 */
export const deleteCareerPath = async (userId) => {
  try {
    delete careerPathStorage[userId]
    return { message: "Career path deleted successfully" }
  } catch (error) {
    console.error("Error deleting career path:", error)
    throw new Error(`Failed to delete career path: ${error.message}`)
  }
}

export default {
  createCareerPath,
  getCareerPath,
  updateCareerPath,
  deleteCareerPath,
}