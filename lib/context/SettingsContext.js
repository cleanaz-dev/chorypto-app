"use client"

import { createContext, useContext, useMemo } from "react"

const SettingsContext = createContext(null)

export function SettingsProvider({ data, children }) {
  const value = useMemo(() => ({
    ...data,
  }), [data])
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}