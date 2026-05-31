"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { DemoModalProvider } from "@/components/site/DemoModalProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoModalProvider>
          <Toaster />
          <Sonner />
          {children}
        </DemoModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
