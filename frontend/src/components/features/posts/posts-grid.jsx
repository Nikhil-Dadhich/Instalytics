import React from 'react'
import { Card, CardContent } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Heart, MessageCircle, Play, Eye, Calendar, ExternalLink } from 'lucide-react'
import { calculateTimeSince } from '../../../lib/utils'

const PostsGrid = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!posts?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-lg">
          No posts found
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <img
              src={post.image}
              alt={post.caption?.substring(0, 50) + '...' || 'Instagram post'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            
            {/* Post Type Badge */}
            <div className="absolute top-2 left-2">
              {post.type === 'Video' ? (
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  <Play className="w-3 h-3 mr-1" />
                  Video
                </Badge>
              ) : post.isCarousel ? (
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  📷 {post.carouselCount}
                </Badge>
              ) : null}
            </div>

            {/* Engagement Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">{post.comments}</span>
                </div>
                {post.views && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">{post.views}</span>
                  </div>
                )}
              </div>
            </div>

            {/* External Link */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Caption */}
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {post.caption}
              </p>

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </div>
                {post.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>
                  {post.timestamp ? calculateTimeSince(post.timestamp) : 'Recently'}
                </span>
              </div>

              {/* Hashtags */}
              {post.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-2 py-0.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </Badge>
                  ))}
                  {post.hashtags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 text-gray-500">
                      +{post.hashtags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default PostsGrid
