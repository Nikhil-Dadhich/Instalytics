import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Grid3x3, BarChart3, Search, Users } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Compare', href: '/compare', icon: BarChart3 },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r  rounded-lg flex items-center justify-center">
              {/* <Grid3x3 className="w-5 h-5 text-white" /> */}
              <img src="/logo3.png" className="w-10 h-10 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Instalytics
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Instagram Analytics Dashboard
          </div>
        </div>
      </div>
    </div>
  )
}
