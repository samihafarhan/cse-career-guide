/**
 * Standardized error handling utility
 */

export const logError = (context, error, additionalInfo = {}) => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    ...additionalInfo
  })
}

export const createApiErrorHandler = (context) => {
  return (error, customMessage) => {
    logError(context, error, { customMessage })
    
    if (customMessage) {
      throw new Error(`${customMessage}: ${error.message}`)
    }
    
    throw error
  }
}

export const handleAsyncError = async (asyncFn, context, customMessage) => {
  try {
    return await asyncFn()
  } catch (error) {
    const errorHandler = createApiErrorHandler(context)
    errorHandler(error, customMessage)
  }
}

export default {
  logError,
  createApiErrorHandler,
  handleAsyncError
}
