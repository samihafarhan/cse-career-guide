import supabase from "./supabase"

export async function login({email, password}) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })    
    if (error) throw new Error(error.message)
    return data
}

export async function signup({email, password}) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    })
    if (error) throw new Error(error.message)
    return data
}

export async function getCurrentUser() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
            console.error('Error getting session:', error)
            throw new Error(error.message)
        }
        
        if (!session?.user) return null

        // Fetch the user's profile data which includes the role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error getting user profile:', profileError)
        }

        // Create merged user object with profile data taking precedence
        const mergedUser = {
            ...session.user,
            // Override with profile data if it exists
            ...(profile && {
                role: profile.role,
                username: profile.username,
                organization: profile.organization,
                bio: profile.bio,
                skills: profile.skills,
                grad_year: profile.grad_year,
                verification_status: profile.verification_status,
                document_type: profile.document_type,
                requested_role: profile.requested_role
            })
        }
        
        return mergedUser
    } catch (error) {
        console.error('Error in getCurrentUser:', error)
        return null
    }
}

export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    return true
}