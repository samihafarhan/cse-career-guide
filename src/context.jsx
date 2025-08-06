import React, { createContext, useContext, useEffect } from "react";
import useFetch from "./hooks/use-fetch";
import { getCurrentUser } from "./db/apiAuth";

const urlcontext = createContext()

const UrlProvider = ({children}) => {
    const {data:user, error, loading, fn:fetchuser} = useFetch(getCurrentUser)
    const isAuthenticated = user?.role === "authenticated"

    useEffect(() => {
        fetchuser()
    }, [])
    
    return (
        <urlcontext.Provider value={{user, fetchuser, loading, isAuthenticated}}>
            {children}
        </urlcontext.Provider>
    )
}

export const UrlState = () => {
    return useContext(urlcontext)
}

export { UrlProvider }