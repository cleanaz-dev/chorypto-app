"use client"

import { createContext, useContext, useMemo } from "react"

const PayoutContext = createContext(null)

export function PayoutProvider({ data, children }) {
  const value = useMemo(() => ({
    ...data,
  }), [data])
  return (
    <PayoutContext.Provider value={value}>
      {children}
    </PayoutContext.Provider>
  )
}

export function usePayout() {
  const context = useContext(PayoutContext)
  if (!context) {
    throw new Error("usePayout must be used within a PayoutProvider")
  }
  return context
}