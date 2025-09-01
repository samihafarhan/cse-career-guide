/**
 * Utility functions for role checking
 */

/**
 * Check if user is a student
 * @param {Object} userProfile - User profile object
 * @returns {boolean}
 */
export const isStudent = (userProfile) => {
  return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'student'
}

/**
 * Check if user is a professor
 * @param {Object} userProfile - User profile object
 * @returns {boolean}
 */
export const isProfessor = (userProfile) => {
  return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'professor'
}

/**
 * Check if user is an alumni
 * @param {Object} userProfile - User profile object
 * @returns {boolean}
 */
export const isAlumni = (userProfile) => {
  return userProfile && userProfile.role && userProfile.role.toLowerCase() === 'alumni'
}

/**
 * Check if user is verified
 * @param {Object} userProfile - User profile object
 * @returns {boolean}
 */
export const isVerified = (userProfile) => {
  return userProfile && userProfile.verification_status === 'verified'
}

/**
 * Check if user role is verified and not just 'user'
 * @param {Object} userProfile - User profile object
 * @returns {boolean}
 */
export const hasVerifiedRole = (userProfile) => {
  return userProfile && 
         userProfile.role && 
         userProfile.role.toLowerCase() !== 'user' && 
         userProfile.verification_status === 'verified'
}
