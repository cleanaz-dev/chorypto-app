"use client"; // Important for client-side context

import { createContext, useContext } from "react";

const DashboardContext = createContext(null);

export function DashboardProvider({ data, children }) {
  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}