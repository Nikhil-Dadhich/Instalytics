import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/use-api";
import {
  Search,
  Loader2,
  ExternalLink,
  User,
  Users,
  Grid3x3,
  TrendingUp,
  Calendar,
  Hash,
} from "lucide-react";
import {
  formatNumber,
  calculateTimeSince,
  getProxiedImageUrl,
} from "../lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedMetric, setSelectedMetric] = useState('both');

  const { data: profileData, isLoading, error } = useProfile(username);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) {
      alert("Please enter a username");
      return;
    }
    navigate(`/dashboard/${searchUsername}`);
  };

  const getChartData = () => {
    if (!profileData?.recentPosts) return [];
    const posts = profileData.recentPosts.slice(0, 10);
    return posts.map((post, index) => ({
      postIndex: index + 1,
      postLabel: `Post ${index + 1}`,
      likes: parseNumber(post.likes) / 1000000,
      comments: parseNumber(post.comments) / 1000,
      views: post.views ? parseNumber(post.views) / 1000000 : 0,
      likesRaw: post.likes, 
      commentsRaw: post.comments, 
      viewsRaw: post.views || null, 
    }));
  };

  const parseNumber = (numValue) => {
    if (!numValue) return 0;
    if (typeof numValue === "number") return numValue;

    const numString = String(numValue);
    const cleanString = numString.replace(/[^\d.]/g, "");
    const num = parseFloat(cleanString) || 0;

    if (numString.includes("M")) return num * 1000000;
    if (numString.includes("K")) return num * 1000;
    return num;
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="text-red-800 dark:text-red-200">
            <h3 className="font-semibold mb-2">Error loading data</h3>
            <p className="text-sm">
              {error.response?.data?.error || error.message}
            </p>
            <p className="text-xs mt-2 text-red-600 dark:text-red-400">
              Please try searching for a different username or wait a moment
              before trying again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Search className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Instagram Analytics
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Search for an Instagram profile to analyze engagement metrics
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Instagram username (e.g., cristiano)"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>{isLoading ? "Loading..." : "Analyze"}</span>
            </button>
          </form>
        </div>
      </div>
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing @{username}...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              This may take 20-30 seconds for fresh data
            </p>
          </div>
        </div>
      )}
      {profileData && !isLoading && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold relative">
                    {profileData.profile.profilePic ? (
                      <>
                        <img
                          src={getProxiedImageUrl(
                            profileData.profile.profilePic
                          )}
                          alt={profileData.profile.name}
                          className="w-20 h-20 rounded-full object-cover opacity-0 transition-opacity duration-300"
                          onLoad={(e) => {
                            e.target.style.opacity = "1";
                            e.target.nextSibling.style.display = "none";
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {profileData.profile.username.charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      profileData.profile.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profileData.profile.name ||
                          profileData.profile.username}
                      </h1>
                      {profileData.profile.verified && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      @{profileData.profile.username}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                      {profileData.profile.bio}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href={profileData.profile.accountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View on Instagram"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.profile.followers}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.profile.following}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Following
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.profile.posts}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Posts</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Engagement Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.analytics.engagementRate}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Avg Likes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.analytics.avgLikes}
                  </p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Avg Comments
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.analytics.avgComments}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Posts Analyzed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.analytics.postsAnalyzed}
                  </p>
                </div>
                <Grid3x3 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {profileData.recentPosts && profileData.recentPosts.length > 0 && (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Posts Performance
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Engagement trends across your last{" "}
            {Math.min(profileData.recentPosts.length, 10)} posts
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedMetric('likes')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'likes'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Likes
          </button>
          <button
            onClick={() => setSelectedMetric('comments')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'comments'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setSelectedMetric('both')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'both'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Both
          </button>
        </div>
      </div>
    </div>
    <div className="p-6" style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={getChartData()}
          margin={{ top: 5, right: 20, left: 40, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="postIndex"
            label={{
              value: "Recent Posts (Latest → Oldest)",
              position: "insideBottom",
              offset: -10,
            }}
          />
          <YAxis
            label={{
              value: selectedMetric === 'likes' ? "❤️ (Millions)" : 
                    selectedMetric === 'comments' ? "💬 (Thousands)" : 
                    "Engagement (❤️: M, 💬: K)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload;

                const formatTooltipNumber = (numValue) => {
                  const num = parseNumber(numValue);
                  if (num >= 1000000) {
                    return `${(num / 1000000).toFixed(1)}M`;
                  } else if (num >= 1000) {
                    return `${(num / 1000).toFixed(1)}K`;
                  } else if (num > 0) {
                    return num.toLocaleString();
                  }
                  return "0";
                };

                return (
                  <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-gray-700">
                    <div className="font-semibold mb-2">
                      Post #{label}
                    </div>
                    <div className="space-y-1">
                      {(selectedMetric === 'likes' || selectedMetric === 'both') && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Likes:</span>
                          <span className="font-medium text-red-400">
                            {formatTooltipNumber(data.likesRaw)}
                          </span>
                        </div>
                      )}
                      {(selectedMetric === 'comments' || selectedMetric === 'both') && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Comments:</span>
                          <span className="font-medium text-blue-400">
                            {formatTooltipNumber(data.commentsRaw)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Legend verticalAlign="top" height={36} />

          {(selectedMetric === 'likes' || selectedMetric === 'both') && (
            <Line
              type="monotone"
              dataKey="likes"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 6, fill: "#ef4444" }}
              name="Likes"
              isAnimationActive={true}
              animationDuration={800}
            />
          )}
          {(selectedMetric === 'comments' || selectedMetric === 'both') && (
            <Line
              type="monotone"
              dataKey="comments"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 6, fill: "#3b82f6" }}
              name="Comments"
              isAnimationActive={true}
              animationDuration={800}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)}


          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Posts
                {/* ({profileData.recentPosts?.length || 0}) */}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Latest posts with engagement metrics
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {profileData.recentPosts?.slice(0, 8).map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-2xl mb-2">
                            {post.type === "Video" || post.videoUrl
                              ? "🎥"
                              : post.isCarousel
                              ? "🖼️"
                              : "📷"}
                          </div>
                          <div className="text-sm font-medium">
                            {post.type === "Video"
                              ? "Video"
                              : post.isCarousel
                              ? `${post.carouselCount} Photos`
                              : "Photo"}
                          </div>
                        </div>
                      </div>

                      <img
                        src={getProxiedImageUrl(post.image)}
                        alt="Post"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                        onLoad={(e) => {
                          e.target.style.opacity = "1";
                        }}
                        onError={() => {
                        }}
                      />

                      <div className="absolute top-2 right-2 flex space-x-1">
                        {post.videoUrl && (
                          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            Video
                          </div>
                        )}
                        {post.isCarousel && (
                          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            {post.carouselCount}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex space-x-4">
                          <span className="flex items-center">
                            ❤️ {post.likes}
                          </span>
                          <span className="flex items-center">
                            💬 {post.comments}
                          </span>
                          {post.views && (
                            <span className="flex items-center">
                              👁️ {post.views}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {calculateTimeSince(post.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {post.captionPreview || post.caption || "No caption"}
                      </p>

                      {post.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.hashtags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full"
                            >
                              <Hash className="w-2 h-2 mr-1" />
                              {tag.replace("#", "")}
                            </span>
                          ))}
                          {post.hashtags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{post.hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium"
                      >
                        View on Instagram
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-green-800 dark:text-green-200">
              <span className="text-sm">
                ✅ Data cached until{" "}
                {new Date(profileData.meta.cacheExpiry).toLocaleString()}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400">
                Source: {profileData.meta.dataSource}
              </span>
            </div>
          </div> */}
        </>
      )}

      {!username && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0 rounded-xl p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to Instagram Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Enter an Instagram username above to analyze their profile
              engagement and metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
