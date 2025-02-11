import * as React from "react"
import { Toast } from "@/components/ui/toast"

interface ErrorContextType {
  showError: (error: string) => void
  clearError: () => void
}

const ErrorContext = React.createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState<string | null>(null)

  const showError = React.useCallback((message: string) => {
    setError(message)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}
      <Toast
        message={error}
        onClose={clearError}
        variant="error"
      />
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = React.useContext(ErrorContext)
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider")
  }
  return context
} 