import React from 'react'
import { useTheme } from './theme-provider'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function Header() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('light')
    else setTheme('light')
  }

  const getThemeIcon = () => {
    if (theme === 'light') return Sun
    if (theme === 'dark') return Moon
    return Monitor
  }

  const ThemeIcon = getThemeIcon()

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Instagram Analytics
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
        >
          <ThemeIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
