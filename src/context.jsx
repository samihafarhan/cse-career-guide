import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import useFetch from "./hooks/use-fetch";
import { getCurrentUser } from "./db/apiAuth";
import supabase from "./db/supabase";

const urlcontext = createContext()

const UrlProvider = ({children}) => {
    const {data:user, error, loading, fn:fetchuser} = useFetch(getCurrentUser)
    const [isSessionLoaded, setIsSessionLoaded] = useState(false)
    const isAuthenticated = user?.role === "authenticated"

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
        <urlcontext.Provider value={{user, fetchuser, loading, isAuthenticated, isSessionLoaded}}>
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
    const { user, isAuthenticated, loading, isSessionLoaded } = UrlState()

    useEffect(() => {
        // Skip check if explicitly requested (for landing page)
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
        loading: loading || !isSessionLoaded
    }
}

export { UrlProvider }