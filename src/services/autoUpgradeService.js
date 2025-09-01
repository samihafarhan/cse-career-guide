import supabase from '../db/supabase.js'

/**
 * Simple automatic role upgrade service
 * Upgrades students to alumni when graduation year < current year
 */

/**
 * Check and upgrade students to alumni automatically
 * This runs silently in the background
 */
export const autoUpgradeStudentsToAlumni = async () => {
  try {
    const currentYear = new Date().getFullYear()
    
    // Find students whose graduation year is before current year
    const { data: studentsToUpgrade, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .lt('grad_year', currentYear) // Less than current year (not equal)
      .not('grad_year', 'is', null)
    
    if (fetchError) {
      console.error('Error fetching students for auto-upgrade:', fetchError)
      return { success: false, error: fetchError.message, upgradedCount: 0 }
    }
    
    if (!studentsToUpgrade || studentsToUpgrade.length === 0) {
      return { success: true, upgradedCount: 0, message: 'No students need auto-upgrade' }
    }
    
    // Update them to alumni
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'alumni' })
      .eq('role', 'student')
      .lt('grad_year', currentYear)
      .not('grad_year', 'is', null)
      .select()
    
    if (updateError) {
      console.error('Error auto-upgrading students:', updateError)
      return { success: false, error: updateError.message, upgradedCount: 0 }
    }
    
    return { 
      success: true, 
      upgradedCount: updatedProfiles.length,
      upgradedProfiles: updatedProfiles,
      message: `Auto-upgraded ${updatedProfiles.length} students to alumni`
    }
    
  } catch (error) {
    console.error('Error in auto-upgrade service:', error)
    return { success: false, error: error.message, upgradedCount: 0 }
  }
}

/**
 * Initialize automatic upgrade checking
 * This runs when the app starts and periodically
 */
export const initAutoUpgrade = () => {
  // Run immediately when service starts
  autoUpgradeStudentsToAlumni()
  
  // Run every hour to check for upgrades
  setInterval(() => {
    autoUpgradeStudentsToAlumni()
  }, 60 * 60 * 1000) // 1 hour = 60 * 60 * 1000 milliseconds
}

/**
 * Check specific user for auto-upgrade when they login/access profile
 * This is called during user authentication
 */
export const checkUserAutoUpgrade = async (userId) => {
  try {
    const currentYear = new Date().getFullYear()
    
    // Get user profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (fetchError || !profile) {
      return { upgraded: false, error: fetchError?.message }
    }
    
    // Check if user should be auto-upgraded
    if (profile.role === 'student' && 
        profile.grad_year && 
        profile.grad_year < currentYear) {
      
      // Upgrade to alumni
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'alumni' })
        .eq('id', userId)
      
      if (updateError) {
        console.error('Error auto-upgrading user:', updateError)
        return { upgraded: false, error: updateError.message }
      }
      
      return { upgraded: true, message: 'Auto-upgraded to alumni' }
    }
    
    return { upgraded: false, message: 'No upgrade needed' }
    
  } catch (error) {
    console.error('Error checking user auto-upgrade:', error)
    return { upgraded: false, error: error.message }
  }
}

export default {
  autoUpgradeStudentsToAlumni,
  initAutoUpgrade,
  checkUserAutoUpgrade
}
