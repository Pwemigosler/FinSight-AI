
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export type Session = {
  id: string;
  isActive: boolean;
  device: string;
  browser: string;
  lastActive: string;
};

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setSessions([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Get biometric credentials from Supabase
        const { data, error } = await supabase
          .from('user_biometrics')
          .select('credential_id, device_info, last_used_at, created_at');
        
        if (error) {
          console.error("Error fetching sessions:", error);
          setSessions([]);
          return;
        }
        
        // Current timestamp for "active" calculation (30 min threshold)
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        
        // Transform biometric records into session objects
        const sessionData: Session[] = data.map(record => {
          // Parse device info
          const deviceInfo = record.device_info || {};
          const userAgent = deviceInfo.userAgent || 'Unknown Device';
          
          // Extract browser and device from user agent
          let browser = 'Unknown Browser';
          let device = 'Unknown Device';
          
          if (userAgent) {
            // Simple browser detection
            if (userAgent.includes('Chrome')) browser = 'Chrome';
            else if (userAgent.includes('Firefox')) browser = 'Firefox';
            else if (userAgent.includes('Safari')) browser = 'Safari';
            else if (userAgent.includes('Edge')) browser = 'Edge';
            else if (userAgent.includes('Opera')) browser = 'Opera';
            
            // Simple device detection
            if (userAgent.includes('iPhone')) device = 'iPhone';
            else if (userAgent.includes('iPad')) device = 'iPad';
            else if (userAgent.includes('Android')) device = 'Android';
            else if (userAgent.includes('Windows')) device = 'Windows';
            else if (userAgent.includes('Mac')) device = 'Mac';
            else if (userAgent.includes('Linux')) device = 'Linux';
          }
          
          // Calculate if session is "active" (used in last 30 min)
          const lastActiveDate = record.last_used_at 
            ? new Date(record.last_used_at)
            : new Date(record.created_at);
            
          const isActive = lastActiveDate > thirtyMinutesAgo;
          
          // Format last active time
          const lastActive = formatLastActive(lastActiveDate);
          
          return {
            id: record.credential_id,
            isActive,
            device,
            browser,
            lastActive
          };
        });
        
        // Sort sessions: active first, then by last active date
        const sortedSessions = sessionData.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          
          // Convert lastActive string back to comparable format and sort by most recent
          const aDate = parseLastActive(a.lastActive);
          const bDate = parseLastActive(b.lastActive);
          
          return bDate.getTime() - aDate.getTime();
        });
        
        setSessions(sortedSessions);
      } catch (err) {
        console.error("Error processing sessions:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
    
    // Add real-time listener for session updates
    const channel = supabase
      .channel('public:user_biometrics')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_biometrics',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchSessions();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const terminateSession = async (sessionId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('user_biometrics')
        .delete()
        .eq('user_id', user.id)
        .eq('credential_id', sessionId);
      
      if (error) {
        console.error("Error terminating session:", error);
        return false;
      }
      
      // Remove from local state
      setSessions(sessions.filter(session => session.id !== sessionId));
      return true;
    } catch (err) {
      console.error("Error terminating session:", err);
      return false;
    }
  };
  
  return {
    sessions,
    loading,
    terminateSession
  };
};

// Helper functions for date formatting
const formatLastActive = (date: Date): string => {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

const parseLastActive = (lastActive: string): Date => {
  // If it's a simple date string, parse it
  if (lastActive.includes('/')) {
    return new Date(lastActive);
  }
  
  // Handle relative time strings
  const now = new Date();
  
  if (lastActive === 'just now') {
    return now;
  }
  
  if (lastActive.includes('minute')) {
    const minutes = parseInt(lastActive);
    const result = new Date(now);
    result.setMinutes(now.getMinutes() - minutes);
    return result;
  }
  
  if (lastActive.includes('hour')) {
    const hours = parseInt(lastActive);
    const result = new Date(now);
    result.setHours(now.getHours() - hours);
    return result;
  }
  
  if (lastActive.includes('day')) {
    const days = parseInt(lastActive);
    const result = new Date(now);
    result.setDate(now.getDate() - days);
    return result;
  }
  
  // Default fallback
  return new Date(0);
};
