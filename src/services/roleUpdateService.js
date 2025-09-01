import { updateStudentsToAlumni, checkAndUpdateUserRole } from './profileService.js'

/**
 * Service for handling automatic role updates from student to alumni
 */

/**
 * Run automatic role update for all students who have graduated
 * @returns {Promise<Object>} Results of the update operation
 */
export const runAutomaticRoleUpdate = async () => {
  try {
    const updatedProfiles = await updateStudentsToAlumni()
    
    const result = {
      success: true,
      updatedCount: updatedProfiles.length,
      updatedProfiles: updatedProfiles,
      timestamp: new Date().toISOString(),
      message: `Successfully updated ${updatedProfiles.length} students to alumni status`
    }
    
    return result
  } catch (error) {
    const result = {
      success: false,
      updatedCount: 0,
      updatedProfiles: [],
      timestamp: new Date().toISOString(),
      error: error.message,
      message: `Failed to run automatic role update: ${error.message}`
    }
    
    console.error('Automatic role update failed:', result)
    return result
  }
}

/**
 * Check and update role for a specific user during login or profile access
 * @param {string} userId 
 * @returns {Promise<Object>} Update result
 */
export const checkUserRoleOnAccess = async (userId) => {
  try {
    const updatedProfile = await checkAndUpdateUserRole(userId)
    
    if (updatedProfile) {
      return {
        success: true,
        updated: true,
        profile: updatedProfile,
        message: 'User role automatically updated to alumni'
      }
    }
    
    return {
      success: true,
      updated: false,
      message: 'No role update needed'
    }
  } catch (error) {
    return {
      success: false,
      updated: false,
      error: error.message,
      message: `Failed to check user role: ${error.message}`
    }
  }
}

/**
 * Initialize automatic role checking (can be called on app startup)
 * This sets up periodic checking if needed
 */
export const initializeRoleUpdates = () => {
  // Run immediate check
  runAutomaticRoleUpdate()
  
  // Set up periodic checking (every 24 hours)
  // In a production environment, this might be handled by a server-side cron job
  setInterval(() => {
    runAutomaticRoleUpdate()
  }, 24 * 60 * 60 * 1000) // 24 hours in milliseconds
}

export { initializeRoleUpdateService }

export default {
  runAutomaticRoleUpdate,
  checkUserRoleOnAccess,
  initializeRoleUpdates
}
