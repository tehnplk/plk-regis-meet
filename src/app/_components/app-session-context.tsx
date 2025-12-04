'use client';

import { createContext, useContext } from 'react';

interface AppSessionContextValue {
  userName?: string | null;
}

const AppSessionContext = createContext<AppSessionContextValue | undefined>(undefined);

export function AppSessionProvider({
  userName,
  children,
}: {
  userName?: string | null;
  children: React.ReactNode;
}) {
  return (
    <AppSessionContext.Provider value={{ userName }}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  const ctx = useContext(AppSessionContext);
  if (!ctx) {
    return { userName: undefined };
  }
  return ctx;
}
