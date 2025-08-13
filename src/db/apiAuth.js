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
        return session?.user || null
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