import { supabase } from '../config/supabaseClient' // Adjust path if needed

export const trackActivity = async (featureName, actionType, metadata = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          feature_name: featureName,
          action_type: actionType,
          metadata
        })
    }
  } catch (error) {
    console.error('Error tracking activity:', error)
  }
}