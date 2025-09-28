import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/layout/theme-provider'
import Sidebar from './components/layout/sidebar'
import Header from './components/layout/header'
import Dashboard from './pages/dashboard'
import Posts from './pages/posts'
import Compare from './pages/compare'
import SearchPage from './pages/search'
import { Toaster } from 'sonner'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,              // Global setting
      cacheTime: Infinity,              // Keep data forever
      refetchOnWindowFocus: false,      // CRITICAL: Don't refetch on focus
      refetchOnMount: false,            // Don't refetch on mount
      refetchOnReconnect: false,        // Don't refetch on reconnect
      retry: false,                     // No retries
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="insta-analytics-theme">
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex">
              <Sidebar />
              <div className="flex-1 flex flex-col ml-64">
                <Header />
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard/:username" element={<Dashboard />} />
                    {/* <Route path="/posts/:username" element={<Posts />} /> */}
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/search" element={<SearchPage />} />
                  </Routes>
                </main>
              </div>
            </div>
            <Toaster position="top-right" />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
