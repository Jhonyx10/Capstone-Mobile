
import React from 'react';
import Navigation from './src/Navigation';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Mapbox [error] RNMBXMapView | Map load failed")
    ) {
      return; 
    }
    originalConsoleError(...args);
  };
  return (
    <QueryClientProvider client={queryClient}>
       <Navigation/>
    </QueryClientProvider>
  );
}
