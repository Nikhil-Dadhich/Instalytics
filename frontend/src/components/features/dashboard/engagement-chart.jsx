import React from 'react'

export default function EngagementChart({ posts }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Engagement Chart Component
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Posts: {posts?.length || 0}
      </p>
    </div>
  )
}
