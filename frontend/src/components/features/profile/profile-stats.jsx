import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Heart, MessageCircle, Eye, TrendingUp, BarChart3 } from 'lucide-react'

const ProfileStats = ({ analytics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) return null

  const stats = [
    {
      title: 'Total Likes',
      value: analytics.totalLikes,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      description: `Average: ${analytics.avgLikes} per post`
    },
    {
      title: 'Total Comments',
      value: analytics.totalComments,
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: `Average: ${analytics.avgComments} per post`
    },
    {
      title: 'Total Views',
      value: analytics.totalViews || 'N/A',
      icon: Eye,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: analytics.videoPostsCount ? `${analytics.videoPostsCount} video posts` : 'No videos'
    },
    {
      title: 'Engagement Rate',
      value: analytics.engagementRate || 'N/A',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      description: `${analytics.totalPostsAnalyzed} posts analyzed`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Post Type Distribution */}
      {analytics.postTypeDistribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Post Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.postTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {type} Posts
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Specific Stats */}
      {analytics.avgVideoViews && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Video Performance
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Average video views: <span className="font-bold">{analytics.avgVideoViews}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProfileStats
