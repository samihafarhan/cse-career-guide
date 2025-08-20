import { useState } from 'react'

/**
 * Custom hook for managing profile field updates
 * @param {Function} updateFunction - The update function to call
 * @param {Function} onSuccess - Callback on successful update
 */
export const useProfileUpdate = (updateFunction, onSuccess = () => {}) => {
  const [newValue, setNewValue] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(null)

  const handleUpdate = async (userId, value = newValue, fieldName = '') => {
    if (!value?.toString().trim()) {
      setError(`${fieldName} cannot be empty`)
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await updateFunction(userId, value)
      setIsDialogOpen(false)
      setNewValue('')
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const openDialog = (currentValue = '') => {
    setNewValue(currentValue)
    setError(null)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setNewValue('')
    setError(null)
  }

  return {
    newValue,
    setNewValue,
    isDialogOpen,
    isUpdating,
    error,
    setError,
    handleUpdate,
    openDialog,
    closeDialog
  }
}

export default useProfileUpdate
