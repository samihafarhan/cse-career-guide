import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import useFetch from "./hooks/use-fetch";
import { getCurrentUser, logout as apiLogout } from "./db/apiAuth";
import { checkUserAutoUpgrade } from "./services/autoUpgradeService";
import supabase from "./db/supabase";

const urlcontext = createContext()

const UrlProvider = ({children}) => {
    const {data:user, error, loading, fn:fetchuser} = useFetch(getCurrentUser)
    const [isSessionLoaded, setIsSessionLoaded] = useState(false)
    // Check authentication using the presence of user and proper auth fields
    const isAuthenticated = Boolean(user && (user.aud === "authenticated" || user.email))

    const logout = async () => {
        try {
            await apiLogout()
            // The auth state change listener will handle fetching user data
        } catch (error) {
            console.error('Error logging out:', error)
            throw error
        }
    }

    useEffect(() => {
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.id)
                if (event === 'INITIAL_SESSION') {
                    setIsSessionLoaded(true)
                }
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    fetchuser()
                    
                    // Auto-check for role upgrade when user signs in
                    if (session?.user?.id) {
                        // Run auto-upgrade check silently in background
                        checkUserAutoUpgrade(session.user.id).then(result => {
                            if (result.upgraded) {
                                console.log('User auto-upgraded to alumni')
                                // Refresh user data to show updated role
                                setTimeout(() => fetchuser(), 1000)
                            }
                        }).catch(error => {
                            console.error('Auto-upgrade check failed:', error)
                        })
                    }
                } else if (event === 'SIGNED_OUT') {
                    fetchuser()
                }
            }
        )
        // Initial user fetch
        fetchuser()
        return () => subscription.unsubscribe()
    }, [])
    return (
        <urlcontext.Provider value={{user, fetchuser, loading, isAuthenticated, isSessionLoaded, logout}}>
            {children}
        </urlcontext.Provider>
    )
}

export const UrlState = () => {
    return useContext(urlcontext)
}

/**
 * Custom hook to check if user is authenticated and redirect to auth page if not
 * @param {boolean} skipCheck - Set to true to skip the authentication check (for landing page)
 * @returns {object} - Returns user, isAuthenticated, and loading state
 */
export const useAuthCheck = (skipCheck = false) => {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading, isSessionLoaded, logout } = UrlState()

    useEffect(() => {
        // Skip check if explicitly requested (for landing page and auth page)
        if (skipCheck) return

        // Don't redirect while still loading user data or session is not loaded
        if (loading || !isSessionLoaded) return

        // Only redirect if we're sure the user is not authenticated
        // and the session has been fully loaded
        if (!isAuthenticated && isSessionLoaded) {
            console.log('Redirecting to /auth because not authenticated')
            navigate('/auth')
        }
    }, [isAuthenticated, loading, isSessionLoaded, navigate, skipCheck])

    return {
        user,
        isAuthenticated,
        loading: loading || !isSessionLoaded,
        logout
    }
}

export { UrlProvider }