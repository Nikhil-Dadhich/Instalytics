import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Heart, MessageCircle, Eye, ExternalLink, X, Calendar } from 'lucide-react'
import { calculateTimeSince } from '../../../lib/utils'

const PostDetail = ({ post, onClose }) => {
  if (!post) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Post Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img
              src={post.image || post.displayUrl}
              alt={post.caption || 'Instagram post'}
              className="w-full h-full object-cover"
            />
            
            {/* Post Type Badge */}
            <div className="absolute top-4 left-4">
              {post.type === 'Video' ? (
                <Badge className="bg-black/70 text-white border-0">
                  Video Post
                </Badge>
              ) : post.isCarousel ? (
                <Badge className="bg-black/70 text-white border-0">
                  Carousel ({post.carouselCount} items)
                </Badge>
              ) : (
                <Badge className="bg-black/70 text-white border-0">
                  Photo Post
                </Badge>
              )}
            </div>
          </div>

          {/* Additional Images for Carousel */}
          {post.additionalImages && post.additionalImages.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Additional Images:</h4>
              <div className="grid grid-cols-3 gap-2">
                {post.additionalImages.map((img, index) => (
                  <div key={index} className="aspect-square rounded overflow-hidden">
                    <img
                      src={img.displayUrl}
                      alt={`Additional image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="font-semibold">{post.likes}</div>
              <div className="text-sm text-gray-500">Likes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold">{post.comments}</div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
            {post.views && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="font-semibold">{post.views}</div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <h4 className="font-semibold mb-2">Caption:</h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {post.caption}
            </p>
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Hashtags:</h4>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-blue-600">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Posted {post.timestamp ? calculateTimeSince(post.timestamp) : 'recently'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button asChild>
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on Instagram
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PostDetail
