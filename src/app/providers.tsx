"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
