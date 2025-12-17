"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import React from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath={basePath ? `${basePath}/api/auth` : '/api/auth'}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#2563eb", // blue-600
            color: "#ffffff",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#2563eb",
          },
        }}
      />
    </SessionProvider>
  );
}
