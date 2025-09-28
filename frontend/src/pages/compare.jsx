import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  ExternalLink,
  Loader2,
  Plus,
  Award,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useAllProfiles, useCompareProfiles } from "../hooks/use-api"; // Removed useProfile
import {
  formatNumber,
  calculateTimeSince,
  getProxiedImageUrl,
} from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";

const PROFILE_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

const Compare = () =>{
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chartData, setChartData] = useState(null);
  const [profileColorMap, setProfileColorMap] = useState({});
  const [selectedMetric, setSelectedMetric] = useState('likes');

  const { data: allProfiles, isLoading: isLoadingProfiles } = useAllProfiles();
  
  const { data: compareData, isLoading: isComparing } = useCompareProfiles(selectedProfiles);

  const availableProfiles = allProfiles?.profiles || [];
  const filteredProfiles = searchTerm
    ? availableProfiles.filter(
        (profile) =>
          profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableProfiles;

  const handleAddProfile = (profile) => {
    if (selectedProfiles.length >= 4) {
      alert("Maximum 4 profiles can be compared at once");
      return;
    }
    if (!selectedProfiles.includes(profile.username)) {
      setSelectedProfiles([...selectedProfiles, profile.username]);
    }
  };

  const handleRemoveProfile = (username) => {
    setSelectedProfiles(selectedProfiles.filter((u) => u !== username));
  };

  const getProfileData = (username) => {
    if (compareData?.profiles?.[username]) {
      return compareData.profiles[username];
    }
    return availableProfiles.find((p) => p.username === username);
  };

  const getAnalyticsData = (username) => {
    const profile = getProfileData(username);
    if (profile) {
      return {
        avgLikes: profile.avgLikes,
        avgComments: profile.avgComments,
        engagementRate: profile.engagementRate,
        postsAnalyzed: profile.totalPosts
      };
    }
    return null;
  };

  const parseFollowerCount = (followerValue) => {
    if (!followerValue) return 0;

    const followerString = String(followerValue);
    const cleanString = followerString.replace(/[^\d.]/g, "");
    const num = parseFloat(cleanString) || 0;

    if (followerString.includes("M")) return num * 1000000; 
    if (followerString.includes("K")) return num * 1000;  
    return num;
  };

  const parseEngagementRate = (rateValue) => {
    if (!rateValue) return 0;
    const rateString = String(rateValue);
    return parseFloat(rateString.replace("%", "")) || 0;
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

  const calculateTotalEngagement = (profile) => {
    if (!profile) return 0;
    
    const actualFollowers = profile.followersRaw || parseFollowerCount(profile.followers || "0");
    const engagementRate = parseEngagementRate(profile.engagementRate || "0%") / 100;
    
    return Math.round(actualFollowers * engagementRate);
  };

  const formatEngagementNumber = (profile) => {
    if (!profile) return "0";
    
    const totalEngagement = calculateTotalEngagement(profile);
    
    if (totalEngagement >= 1000000) {
      return `${(totalEngagement / 1000000).toFixed(1)}M`;
    } else if (totalEngagement >= 1000) {
      return `${Math.round(totalEngagement / 1000)}K`;
    } else if (totalEngagement > 0) {
      return totalEngagement.toLocaleString();
    }
    return "0";
  };

  const formatLargeNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${Math.round(num / 1000)}K`;
    } else if (num > 0) {
      return num.toLocaleString();
    }
    return "0";
  };

  const getTopPerformers = () => {
    if (!chartData || chartData.length === 0) return {};
    
    const performers = {
      byEngagementRate: chartData.reduce((max, profile) => 
        profile.engagementRate > max.engagementRate ? profile : max
      ),
      byTotalEngagement: chartData.reduce((max, profile) => {
        const maxTotal = calculateTotalEngagement(max);
        const profileTotal = calculateTotalEngagement(profile);
        return profileTotal > maxTotal ? profile : max;
      }),
      byFollowers: chartData.reduce((max, profile) => 
        profile.followers > max.followers ? profile : max
      ),
      byAvgLikes: chartData.reduce((max, profile) => 
        profile.avgLikes > max.avgLikes ? profile : max
      )
    };
    
    return performers;
  };

  const getChartData = () => {
    if (!selectedProfiles.length || isComparing) return [];
    
    const allPostsData = [];
    let maxPosts = 10;
    let hasAnyPosts = false;
    
    selectedProfiles.forEach(username => {
      const profile = getProfileData(username);
      console.log(`🔍 ${username} profile:`, profile);
      console.log(`🔍 ${username} recentPosts:`, profile?.recentPosts);
      
      const postsCount = profile?.recentPosts?.length || 0;
      if (postsCount > 0) {
        maxPosts = Math.min(maxPosts, postsCount);
        hasAnyPosts = true;
      }
    });
    
    console.log('🔍 maxPosts:', maxPosts);
    
    if (!hasAnyPosts) return [];
    
    for (let i = 0; i < maxPosts; i++) {
      const postData = {
        postIndex: i + 1,
        postLabel: `Post ${i + 1}`
      };
      
      selectedProfiles.forEach(username => {
        const profile = getProfileData(username);
        const post = profile?.recentPosts?.[i];
        
        if (post) {
          postData[`likes_${username}`] = parseNumber(post.likes) / 1000000;
          postData[`comments_${username}`] = parseNumber(post.comments) / 1000;
          postData[`views_${username}`] = post.views ? parseNumber(post.views) / 1000000 : 0;
          postData[`likesRaw_${username}`] = post.likes;
          postData[`commentsRaw_${username}`] = post.comments;
          postData[`viewsRaw_${username}`] = post.views;
        }
      });
      
      allPostsData.push(postData);
    }
    
    return allPostsData;
  };

  const getPostTrendsData = () => {
    const chartData = getChartData();
    
    return chartData.map(post => {
      const trendPoint = {
        postIndex: post.postIndex,
        postLabel: post.postLabel
      };
      
      selectedProfiles.forEach(username => {
        let value = 0;
        switch (selectedMetric) {
          case 'likes':
            value = post[`likes_${username}`] || 0;
            break;
          case 'comments':
            value = post[`comments_${username}`] || 0;
            break;
          case 'views':
            value = post[`views_${username}`] || 0;
            break;
        }
        trendPoint[username] = value;
      });
      
      return trendPoint;
    });
  };

  const formatMetricValue = (value, metric) => {
    switch (metric) {
      case 'likes': return `${value.toFixed(1)}M`;
      case 'comments': return `${value.toFixed(1)}K`;
      case 'views': return `${value.toFixed(1)}M`;
      default: return value.toString();
    }
  };

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'likes': return 'Likes (Millions)';
      case 'comments': return 'Comments (Thousands)';
      case 'views': return 'Views (Millions)';
      default: return 'Value';
    }
  };
  useEffect(() => {
    if (selectedProfiles.length >= 2 && compareData) {
      const colorMap = {};
      selectedProfiles.forEach((username, index) => {
        colorMap[username] = PROFILE_COLORS[index % PROFILE_COLORS.length];
      });
      setProfileColorMap(colorMap);

      const profiles = selectedProfiles
        .map((username) => {
          const profile = getProfileData(username);
          const analytics = getAnalyticsData(username);

          if (!profile) return null;
          const rawFollowers = profile.followersRaw || parseFollowerCount(profile.followers || "0");
          return {
            name:
              (profile.name || username).length > 12
                ? (profile.name || username).substring(0, 12) + "..."
                : profile.name || username,
            fullName: profile.name || username,
            username,
            color: colorMap[username],
            followers: rawFollowers / 1000000,
            followersRaw: rawFollowers,
            avgLikes:
              parseNumber(analytics?.avgLikes || profile?.avgLikes || 0) /
              1000000,
            avgComments:
              parseNumber(analytics?.avgComments || profile?.avgComments || 0) /
              1000,
            engagementRate: parseEngagementRate(
              analytics?.engagementRate || profile?.engagementRate || "0%"
            ),
            postsAnalyzed: analytics?.postsAnalyzed || profile?.totalPosts || 0,
          };
        })
        .filter(Boolean);

      if (profiles.length > 0) {
        setChartData(profiles);
      }
    } else {
      setChartData(null);
      setProfileColorMap({});
    }
  }, [compareData, selectedProfiles]);

  const ColorLegend = () => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Profile Colors
      </h4>
      <div className="flex flex-wrap gap-4">
        {selectedProfiles.map((username) => {
          const profile = getProfileData(username);
          const color = profileColorMap[username];
          return (
            <div key={username} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {profile?.name || username}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compare Instagram Profiles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select profiles to compare their engagement metrics with interactive
          charts
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Profiles to Compare
          </h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search profiles..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {selectedProfiles.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected for Comparison ({selectedProfiles.length}/4)
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedProfiles.map((username) => {
                  const profile = getProfileData(username);
                  return (
                    <div
                      key={username}
                      className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm font-medium">
                        {profile?.name || username}
                      </span>
                      <button
                        onClick={() => handleRemoveProfile(username)}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {isLoadingProfiles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No profiles match your search"
                : "No profiles available"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile) => {
                const isSelected = selectedProfiles.includes(profile.username);
                return (
                  <div
                    key={profile.username}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      isSelected
                        ? handleRemoveProfile(profile.username)
                        : handleAddProfile(profile)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold relative overflow-hidden">
                        {profile.profilePic ? (
                          <>
                            <img
                              src={getProxiedImageUrl(profile.profilePic)}
                              alt={profile.name || profile.username}
                              className="w-12 h-12 rounded-full object-cover opacity-0 transition-opacity duration-300"
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
                              {profile.username.charAt(0).toUpperCase()}
                            </div>
                          </>
                        ) : (
                          profile.username.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {profile.name || profile.username}
                          </h3>
                          {profile.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                          @{profile.username} • {profile.followers} followers
                        </p>
                      </div>

                      <div className="text-purple-600 flex-shrink-0">
                        {isSelected ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedProfiles.length >= 2 && (
        <div className="space-y-6">
          {isComparing && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Comparing {selectedProfiles.length} profiles...
                </p>
              </div>
            </div>
          )}


          {chartData && chartData.length > 0 && !isComparing && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Award className="w-5 h-5 text-purple-500 mr-2" />
                  Performance Leaders
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        🎯 Best Engagement Rate
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {getTopPerformers().byEngagementRate?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getTopPerformers().byEngagementRate?.engagementRate || 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        🔥 Most Total Engagement
                      </div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {getTopPerformers().byTotalEngagement?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatEngagementNumber(getTopPerformers().byTotalEngagement || {})}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        👥 Most Followers
                      </div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {getTopPerformers().byFollowers?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getTopPerformers().byFollowers?.followers?.toFixed(0) || 0}M
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        ❤️ Most Avg Likes
                      </div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {getTopPerformers().byAvgLikes?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getTopPerformers().byAvgLikes?.avgLikes?.toFixed(1) || 0}M
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  📊 Overall Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedProfiles.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Profiles Compared
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {chartData
                        .reduce((sum, profile) => sum + profile.followers, 0)
                        .toFixed(0)}
                      M
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Followers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {(
                        chartData.reduce(
                          (sum, profile) => sum + profile.engagementRate,
                          0
                        ) / chartData.length
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Engagement Rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {(() => {
                        const totalEngagement = chartData.reduce((sum, profile) => {
                          return sum + calculateTotalEngagement(profile);
                        }, 0);
                        return formatLargeNumber(totalEngagement);
                      })()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Combined Engagement
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {chartData && chartData.length > 0 && !isComparing && <ColorLegend />}

          {chartData && chartData.length > 0 && !isComparing && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Heart className="w-5 h-5 text-red-500 mr-2" />
                    Average Likes Comparison
                  </h3>
                </div>
                <div className="p-6" style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        label={{
                          value: "Likes (Millions)",
                          angle: -90,
                          position: "insideLeft",
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-gray-700">
                                <div className="font-semibold mb-2">
                                  {data.fullName || data.name}
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">
                                    Avg Likes:
                                  </span>
                                  <span className="font-medium text-red-400">
                                    {data.avgLikes.toFixed(1)}M
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="avgLikes">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                    Average Comments Comparison
                  </h3>
                </div>
                <div className="p-6" style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        label={{
                          value: "Comments (Thpousands)",
                          angle: -90,
                          position: "insideLeft",
                          // dy: 80
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-gray-700">
                                <div className="font-semibold mb-2">
                                  {data.fullName || data.name}
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">
                                    Avg Comments:
                                  </span>
                                  <span className="font-medium text-blue-400">
                                    {data.avgComments.toFixed(1)}K
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="avgComments">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                    Engagement Rate Comparison
                  </h3>
                </div>
                <div className="p-6" style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        label={{
                          value: "Rate (%)",
                          angle: -90,
                          position: "insideLeft",
                          style: { textAnchor: "middle" },
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-gray-700">
                                <div className="font-semibold mb-2">
                                  {data.fullName || data.name}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Engagement Rate:</span>
                                    <span className="font-medium text-green-400">{data.engagementRate}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Total Engagement:</span>
                                    <span className="font-medium text-yellow-400">{formatEngagementNumber(data)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Followers:</span>
                                    <span className="font-medium text-blue-400">{data.followers.toFixed(0)}M</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {chartData.map((entry, index) => (
                        <Line
                          key={`line-${index}`}
                          type="monotone"
                          dataKey={`engagementRate`}
                          stroke={entry.color}
                          strokeWidth={3}
                          dot={{ r: 6, fill: entry.color }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Users className="w-5 h-5 text-purple-500 mr-2" />
                    Followers vs Engagement Analysis
                  </h3>
                </div>
                <div className="p-6" style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <ScatterChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 50, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="followers"
                        name="followers"
                        unit="M"
                        type="number"
                        label={{
                          value: "Followers (M)",
                          position: "insideBottom",
                          offset: -10,
                        }}
                      />
                      <YAxis
                        dataKey="engagementRate"
                        name="engagement"
                        unit="%"
                        type="number"
                        label={{
                          value: "Rate (%)",
                          angle: -90,
                          position: "insideLeft",
                          style: { textAnchor: "middle" },
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-gray-700">
                                <div className="font-semibold mb-2">
                                  {data.fullName || data.name}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Followers:</span>
                                    <span className="font-medium text-blue-400">{data.followers.toFixed(0)}M</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Engagement Rate:</span>
                                    <span className="font-medium text-green-400">{data.engagementRate}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Total Engagement:</span>
                                    <span className="font-medium text-yellow-400">{formatEngagementNumber(data)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter dataKey="engagementRate" name="Engagement Rate">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 col-span-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <BarChart3 className="w-5 h-5 text-orange-500 mr-2" />
                    Recent Posts Performance (Likes)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Individual post likes comparison across profiles
                  </p>
                </div>
                <div className="p-6" style={{ width: '100%', height: 400 }}>
                  {getChartData().length > 0 ? (
                    <ResponsiveContainer>
                      <BarChart data={getChartData()} margin={{ top: 5, right: 20, left: 40, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="postLabel" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis label={{ value: 'Likes (Millions)', angle: -90, position: 'insideLeft' ,style: { textAnchor: 'middle' }}} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length > 0) {
                              return (
                                <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-gray-700">
                                  <div className="font-semibold mb-2">
                                    {label}
                                  </div>
                                  <div className="space-y-1">
                                    {payload.map((entry, index) => {
                                      const username = entry.dataKey.replace('likes_', '')
                                      const profile = getProfileData(username)
                                      const rawLikes = entry.payload[`likesRaw_${username}`]
                                      return (
                                        <div key={index} className="flex justify-between">
                                          <span className="text-gray-300" style={{ color: entry.color }}>
                                            {profile?.name || username}:
                                          </span>
                                          <span className="font-medium" style={{ color: entry.color }}>
                                            {rawLikes}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        {selectedProfiles.map((username, index) => {
                          const color = profileColorMap[username]
                          const profile = getProfileData(username)
                          return (
                            <Bar 
                              key={username}
                              dataKey={`likes_${username}`} 
                              name={profile?.name || username}
                              fill={color}
                              opacity={0.8}
                            />
                          )
                        })}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : isComparing ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading recent posts...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent posts data available</p>
                        <p className="text-sm">Select profiles with recent posts to see this chart</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 col-span-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
                        Post Performance Trends
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Track performance trends across recent posts
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {['likes', 'comments'].map(metric => (
                        <button
                          key={metric}
                          onClick={() => setSelectedMetric(metric)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            selectedMetric === metric
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {metric.charAt(0).toUpperCase() + metric.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6" style={{ width: '100%', height: 400 }}>
                  {getPostTrendsData().length > 0 ? (
                    <ResponsiveContainer>
                      <LineChart data={getPostTrendsData()} margin={{ top: 5, right: 20, left: 40, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="postIndex" 
                          label={{ value: 'Recent Posts (Latest → Oldest)', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          label={{ 
                            value: getMetricLabel(selectedMetric), 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                          }} 
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length > 0) {
                              return (
                                <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-gray-700">
                                  <div className="font-semibold mb-2">
                                    Post #{label}
                                  </div>
                                  <div className="space-y-1">
                                    {payload.map((entry, index) => {
                                      const profile = getProfileData(entry.dataKey)
                                      return (
                                        <div key={index} className="flex justify-between">
                                          <span className="text-gray-300" style={{ color: entry.color }}>
                                            {profile?.name || entry.dataKey}:
                                          </span>
                                          <span className="font-medium" style={{ color: entry.color }}>
                                            {formatMetricValue(entry.value, selectedMetric)}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        {selectedProfiles.map((username) => {
                          const profile = getProfileData(username)
                          const color = profileColorMap[username]
                          return (
                            <Line
                              key={username}
                              type="monotone"
                              dataKey={username}
                              name={profile?.name || username}
                              stroke={color}
                              strokeWidth={3}
                              dot={{ r: 5, fill: color }}
                              connectNulls={false}
                            />
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : isComparing ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading recent posts...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent posts data available</p>
                        <p className="text-sm">Select profiles with recent posts to see trends</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {compareData && !isComparing && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Comparison
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedProfiles.map((username) => {
                    const profile = getProfileData(username);
                    const analytics = getAnalyticsData(username);
                    const profileColor = profileColorMap[username];

                    return (
                      <div
                        key={username}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-t-4"
                        style={{ borderTopColor: profileColor }}
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold relative overflow-hidden">
                            {profile?.profilePic ? (
                              <>
                                <img
                                  src={getProxiedImageUrl(profile.profilePic)}
                                  alt={profile.name || profile.username}
                                  className="w-16 h-16 rounded-full object-cover opacity-0 transition-opacity duration-300"
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
                                  {username.charAt(0).toUpperCase()}
                                </div>
                              </>
                            ) : (
                              username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {profile?.name || username}
                              </h3>
                              {profile?.verified && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              @{username}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Followers:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {profile?.followers || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Following:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {profile?.following || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Posts:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {profile?.posts || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Avg Likes:
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {profile?.avgLikes || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Avg Comments:
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {profile?.avgComments || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Engagement:
                            </span>
                            <span className="font-semibold" style={{ color: profileColor }}>
                              {profile?.engagementRate || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <a
                            href={profile?.accountUrl || `https://instagram.com/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Profile
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedProfiles.length < 2 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select profiles to compare
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Choose at least 2 profiles from the list above to see detailed
            comparison charts
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Compare average likes, comments, engagement rates, and follower
            relationships with interactive charts
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;