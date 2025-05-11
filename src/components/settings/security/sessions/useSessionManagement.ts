
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

export type Session = {
  id: string;
  deviceName: string;
  browser: string;
  lastActive: string;
  isCurrentSession: boolean;
};

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a mock implementation. In a real app, we'd fetch from Supabase
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    
    // In a production app, we'd fetch real sessions from Supabase
    // For this demo, we'll generate some mock data
    try {
      // Attempt to fetch sessions from user_biometrics table
      const { data, error } = await supabase
        .from('user_biometrics')
        .select('*');
        
      if (error) {
        console.error("Error fetching sessions:", error);
        generateMockSessions();
        return;
      }
      
      // Transform the biometrics data into session objects
      const sessionData: Session[] = data.map((row: any) => {
        // Safely access userAgent property with type checking
        const deviceInfo = row.device_info || {};
        const userAgent = typeof deviceInfo === 'object' && deviceInfo !== null && 'userAgent' in deviceInfo 
          ? String(deviceInfo.userAgent || '') 
          : 'Unknown';
        
        const browser = getBrowserFromUserAgent(userAgent);
        const deviceName = getDeviceFromUserAgent(userAgent);
        
        return {
          id: row.id || uuidv4(),
          deviceName: deviceName || 'Unknown device',
          browser: browser || 'Unknown browser',
          lastActive: row.last_used_at || row.created_at || new Date().toISOString(),
          isCurrentSession: false // We'll mark the current session below
        };
      });
      
      // If we got data from Supabase, mark the current session
      if (sessionData.length > 0) {
        // In a real app, we'd identify the current session
        // For demo purposes, just mark the first one
        const updatedSessions = [...sessionData];
        if (updatedSessions.length > 0) {
          updatedSessions[0] = { ...updatedSessions[0], isCurrentSession: true };
        }
        
        setSessions(updatedSessions);
      } else {
        // Fallback to mock data if no sessions found
        generateMockSessions();
      }
    } catch (err) {
      console.error("Error in session management:", err);
      generateMockSessions();
    } finally {
      setLoading(false);
    }
  };

  const generateMockSessions = () => {
    // For demo purposes only - generate mock sessions
    const mockSessions: Session[] = [
      {
        id: "current-session",
        deviceName: "Current Device",
        browser: "Chrome on Windows",
        lastActive: new Date().toISOString(),
        isCurrentSession: true
      },
      {
        id: uuidv4(),
        deviceName: "iPhone 13",
        browser: "Safari Mobile",
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isCurrentSession: false
      },
      {
        id: uuidv4(),
        deviceName: "MacBook Pro",
        browser: "Firefox",
        lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isCurrentSession: false
      }
    ];
    
    setSessions(mockSessions);
  };

  const terminateSession = async (sessionId: string) => {
    // In a real app, we would terminate the session in Supabase
    // and remove the biometric credentials
    
    try {
      // If this is a real session ID from Supabase, try to delete it
      const { error } = await supabase
        .from('user_biometrics')
        .delete()
        .eq('id', sessionId);
        
      if (error) {
        console.error("Error terminating session:", error);
        // Fall back to just updating the UI
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        return;
      }
      
      // If successful or the session wasn't found, update the UI
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
    } catch (err) {
      console.error("Error in session termination:", err);
      // Even on error, update the UI for better UX
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    }
  };

  // Helper functions to parse user agent string
  const getBrowserFromUserAgent = (userAgent: string): string => {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown Browser';
  };
  
  const getDeviceFromUserAgent = (userAgent: string): string => {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Linux')) return 'Linux PC';
    return 'Unknown Device';
  };

  return {
    sessions,
    loading,
    terminateSession
  };
};
