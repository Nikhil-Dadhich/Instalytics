import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, ExternalLink, Clock } from 'lucide-react'
import { useAllProfiles } from '../hooks/use-api'
import { formatNumber, calculateTimeSince, getProxiedImageUrl } from '../lib/utils'

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { data: allProfiles, isLoading } = useAllProfiles()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      const username = searchTerm.trim().replace('@', '')
      navigate(`/dashboard/${username}`)
    }
  }

  const recentProfiles = allProfiles?.profiles || []
  const filteredProfiles = searchTerm
    ? recentProfiles.filter(profile =>
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recentProfiles

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Instagram Profiles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter an Instagram username to analyze their profile and engagement
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Instagram username (e.g., cristiano, leomessi)"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={!searchTerm.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Analyze</span>
          </button>
        </form>
      </div>

      {/* Recent Profiles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recently Analyzed Profiles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {recentProfiles.length} profiles in cache
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No profiles match your search' : 'No profiles analyzed yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.username}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/${profile.username}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Profile Picture with Fallback */}
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold relative overflow-hidden">
                      {profile.profilePic ? (
                        <>
                          <img 
                            src={getProxiedImageUrl(profile.profilePic)} 
                            alt={profile.name || profile.username}
                            className="w-12 h-12 rounded-full object-cover opacity-0 transition-opacity duration-300"
                            onLoad={(e) => {
                              e.target.style.opacity = '1'
                              e.target.nextSibling.style.display = 'none'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            {profile.username.charAt(0).toUpperCase()}
                          </div>
                        </>
                      ) : (
                        profile.username.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {profile.name || profile.username}
                        </h3>
                        {profile.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        @{profile.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatNumber(profile.followers)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        followers
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {calculateTimeSince(profile.lastScraped)}
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
