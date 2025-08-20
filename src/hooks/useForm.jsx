import { useState } from 'react'

/**
 * Custom hook for managing form state and validation
 * @param {Object} initialState 
 * @param {Function} validationSchema 
 */
export const useForm = (initialState = {}, validationSchema = null) => {
  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = async () => {
    if (!validationSchema) return true

    try {
      await validationSchema.validate(formData, { abortEarly: false })
      setErrors({})
      return true
    } catch (validationErrors) {
      const errorMap = {}
      validationErrors.inner.forEach(error => {
        errorMap[error.path] = error.message
      })
      setErrors(errorMap)
      return false
    }
  }

  const resetForm = () => {
    setFormData(initialState)
    setErrors({})
    setSubmitError(null)
    setLoading(false)
  }

  const handleSubmit = async (submitFunction) => {
    setErrors({})
    setSubmitError(null)

    const isValid = await validateForm()
    if (!isValid) return false

    setLoading(true)
    
    try {
      await submitFunction(formData)
      return true
    } catch (error) {
      setSubmitError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    formData,
    setFormData,
    errors,
    loading,
    submitError,
    handleChange,
    handleSelectChange,
    handleSubmit,
    resetForm,
    setLoading,
    setSubmitError,
    setErrors
  }
}

export default useForm
