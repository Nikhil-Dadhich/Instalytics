import React from 'react'
import { Card, CardContent } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Heart, MessageCircle, Eye, ExternalLink, Play } from 'lucide-react'

const PostCard = ({ post, onClick }) => {
  if (!post) return null

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => onClick?.(post)}>
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <img
          src={post.image || post.displayUrl}
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
          ) : post.isCarousel && post.carouselCount > 1 ? (
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
        <div className="space-y-2">
          {/* Caption */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {post.caption}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
            {post.views && <span>{post.views} views</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PostCard
