import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Simple verification service using base64 storage in database
 */

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 data URL
 */
export const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader() //built-in browser tool that knows how to read the contents of file
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Upload verification document as base64 to database
 * @param {File} file - PDF file to upload
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result
 */
export const uploadVerificationDocumentSimple = async (file, userId) => {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file)

    return {
      method: 'base64',
      data: base64Data,
      fileName: file.name
    }

  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }
}

/**
 * Update verification status using base64 data stored in database
 * @param {string} userId - User ID
 * @param {Object} uploadResult - Result from upload function
 * @returns {Promise<Object>} Updated profile
 */
export const updateVerificationStatusSimple = async (userId, uploadResult) => {
  try {
    // Get user email
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }

    // Store the base64 data directly in document_path
    const documentPath = uploadResult.data

    // First, check if user profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Update using only existing columns
    const updateData = {
      verification_status: 'pending_review',
      document_path: documentPath
    }

    let result;
    
    if (existingProfile) {
      // Profile exists, update it
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData) // Update profile with new document path
        .eq('id', userId)
        .select()

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`)
      }
      
      result = data[0]
    } else {
      // Profile doesn't exist, try to create it (with error handling for race conditions)
      const createData = {
        id: userId,
        email: user.email,
        role: 'user',
        ...updateData
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([createData])
        .select()

      if (error) {
        // If insert fails due to duplicate key (race condition), try to update instead
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          console.log('Profile created by another process, updating instead...')
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({
              verification_status: 'pending_review',
              document_path: documentPath
            })
            .eq('id', userId)
            .select()

          if (updateError) {
            throw new Error(`Failed to update existing profile: ${updateError.message}`)
          }
          
          result = updateData[0]
        } else {
          throw new Error(`Failed to create profile: ${error.message}`)
        }
      } else {
        result = data[0]
      }
    }

    return result

  } catch (error) {
    throw new Error(`Verification update failed: ${error.message}`)
  }
}

/**
 * Get document URL from either base64 data or storage path
 * @param {string} documentPath - Base64 data or storage path from database
 * @param {Object} profile - User profile (optional, for compatibility)
 * @returns {Promise<string>} Document URL
 */
export const getDocumentUrlSimple = async (documentPath, profile = null) => {
  try {
    if (!documentPath) {
      throw new Error('No document path provided') 
    }

    // Check if it's base64 data (new format)
    if (documentPath.startsWith('data:')) {
      return documentPath
    } 
    // Check if it's a storage path (old)
    else if (documentPath.includes('/') && !documentPath.startsWith('data:')) {
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(documentPath, 3600)

      if (error) {
        throw new Error(error.message)
      }

      return data.signedUrl
    } 
    else {
      throw new Error('Invalid document format - expected base64 data or storage path')
    }

  } catch (error) {
    throw new Error(`Failed to get document URL: ${error.message}`)
  }
}

/**
 * Get pending verifications for admin
 * @returns {Promise<Array>} Pending verifications
 */
export const getPendingVerificationsSimple = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('verification_status', 'pending_review')

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    throw new Error(`Failed to get pending verifications: ${error.message}`)
  }
}

/**
 * Approve verification
 * @param {string} userId - User ID
 * @param {string} role - Role to assign (student, professor, alumni, etc.)
 * @returns {Promise<Object>} Updated profile
 */
export const approveVerificationSimple = async (userId, role = 'student') => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        verification_status: 'verified',
        role: role
      })
      .eq('id', userId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data[0]
  } catch (error) {
    throw new Error(`Failed to approve verification: ${error.message}`)
  }
}

/**
 * Reject verification
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated profile
 */
export const rejectVerificationSimple = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        verification_status: 'rejected'
      })
      .eq('id', userId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data[0]
  } catch (error) {
    throw new Error(`Failed to reject verification: ${error.message}`)
  }
}

/**
 * Fix common RLS and profile issues
 * @param {string} userId 
 * @param {string} email 
 * @returns {Promise<Object>} Fix results
 */
export const fixUserProfileIssues = async (userId, email) => {
  const results = {
    success: false,
    profile_created: false,
    profile_updated: false,
    errors: []
  }

  try {
    // First, try to get current user to ensure we have auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      results.errors.push('User not authenticated')
      return results
    }

    if (user.id !== userId) {
      results.errors.push('User ID mismatch')
      return results
    }

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      results.errors.push(`Error checking profile: ${fetchError.message}`)
      return results
    }

    if (!existingProfile) {
      // Profile doesn't exist, try to create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          role: 'unverified'
        })
        .select()
        .single()

      if (createError) {
        results.errors.push(`Error creating profile: ${createError.message}`)
        return results
      } else {
        results.profile_created = true
        results.success = true
      }
    } else {
      // Profile exists, try to update it
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          email: email,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        results.errors.push(`Error updating profile: ${updateError.message}`)
        return results
      } else {
        results.profile_updated = true
        results.success = true
      }
    }

  } catch (error) {
    results.errors.push(`General error: ${error.message}`)
  }

  return results
}

// Export the enhanced methods for backward compatibility
export const uploadVerificationDocumentWithFallback = uploadVerificationDocumentSimple
export const updateVerificationStatus = updateVerificationStatusSimple
export const getPendingVerifications = getPendingVerificationsSimple
export const getDocumentSignedUrl = getDocumentUrlSimple
export const approveVerification = approveVerificationSimple
export const rejectVerification = rejectVerificationSimple
