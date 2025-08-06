import { useState } from "react"

const useFetch = (cb,options={}) => {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const fn = async (...args) => {
        setLoading(true)
        setError(null)
        try {
            const result = await cb(...args)
            setData(result)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }
    return {
        data,
        error,
        loading,
        fn
    }
}

export default useFetch