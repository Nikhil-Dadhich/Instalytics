import React from 'react'

export default function AnalyticsCards({ analytics }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Analytics Cards Component
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Avg Likes: {analytics?.avgLikes || 'Loading...'}
      </p>
    </div>
  )
}
