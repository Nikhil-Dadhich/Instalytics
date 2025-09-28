import React from 'react'
import { Card, CardContent } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { ExternalLink, Shield, Briefcase, Users, Image } from 'lucide-react'

const ProfileHeader = ({ profile, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 animate-pulse">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <img
              src={profile.profilePic}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {/* Name and Username */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {profile.name}
                {profile.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.businessAccount && (
                  <Badge variant="outline" className="border-purple-200 text-purple-800">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Business
                  </Badge>
                )}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">@{profile.username}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Image className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{profile.posts}</span>
                <span className="text-gray-500">posts</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{profile.followers}</span>
                <span className="text-gray-500">followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{profile.following}</span>
                <span className="text-gray-500">following</span>
              </div>
            </div>

            {/* Profile Link */}
            <div className="flex items-center gap-2">
              <a
                href={`https://instagram.com/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Instagram
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileHeader
