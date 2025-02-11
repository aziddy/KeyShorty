import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string | null
  onClose: () => void
  variant?: "default" | "error"
}

export function Toast({ message, onClose, variant = "default" }: ToastProps) {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto dismiss after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!message) return null

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-2",
        variant === "error" ? "bg-red-100 text-red-900" : "bg-white text-gray-900"
      )}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-red-200 transition-colors"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
} 