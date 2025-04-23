"use client"

import { Loader2 } from "lucide-react"

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
    </div>
  )
}