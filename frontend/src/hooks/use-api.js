import { useQuery } from '@tanstack/react-query'
import { profileAPI } from '../lib/api'
import { toast } from 'sonner'

export function useProfile(username) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileAPI.getProfile(username).then(res => res.data),
    enabled: !!username,
    
    // 🔒 PREVENT ALL DUPLICATE REQUESTS
    staleTime: Infinity,              // Never consider data stale
    cacheTime: Infinity,              // Keep in cache forever
    refetchOnMount: false,            // Don't refetch when component mounts
    refetchOnWindowFocus: false,      // Don't refetch when window focused
    refetchOnReconnect: false,        // Don't refetch when network reconnects
    refetchInterval: false,           // Never auto-refetch
    refetchIntervalInBackground: false, // Never refetch in background
    retry: false,                     // Don't retry failed requests
    
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to fetch profile')
    }
  })
}

export function usePosts(username) {
  return useQuery({
    queryKey: ['posts', username],
    queryFn: () => profileAPI.getPosts(username).then(res => res.data),
    enabled: !!username,
    
    // 🔒 SAME PROTECTION
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false,
    
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to fetch posts')
    }
  })
}

export function useCompareProfiles(usernames) {
  return useQuery({
    queryKey: ['compare', usernames.sort().join(',')],
    queryFn: () => profileAPI.compareProfiles(usernames).then(res => res.data),
    enabled: usernames.length >= 2,
    
    // 🔒 SAME PROTECTION
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false,
    
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to compare profiles')
    }
  })
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => profileAPI.getAllProfiles().then(res => res.data),
    
    // 🔒 SAME PROTECTION
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false,
  })
}

// 🗑️ REMOVED: useRefreshProfile - No manual refresh needed
// Backend handles 1-week cache automatically
