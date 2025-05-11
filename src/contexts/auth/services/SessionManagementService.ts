
/**
 * Service responsible for session management operations
 */
export class SessionManagementService {
  /**
   * Get all active sessions for a user
   */
  getActiveSessions() {
    // This would typically fetch from an API or local storage
    // For now, we're just returning a mock current session
    return [
      {
        id: "current",
        isActive: true,
        device: this.getDeviceInfo(),
        browser: this.getBrowserInfo(),
        lastActive: "now",
      }
    ];
  }

  /**
   * Terminates a specific session by id
   */
  terminateSession(sessionId: string) {
    // This would typically send a request to terminate the session
    console.log(`Terminating session: ${sessionId}`);
    // Mock implementation for now
    return true;
  }

  /**
   * Terminates all sessions except the current one
   */
  terminateAllOtherSessions() {
    // This would typically send a request to terminate all other sessions
    console.log("Terminating all other sessions");
    // Mock implementation for now
    return true;
  }

  /**
   * Helper method to get device information
   */
  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    if (/Windows/.test(userAgent)) return "Windows";
    if (/Macintosh/.test(userAgent)) return "Mac";
    if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
    if (/Android/.test(userAgent)) return "Android";
    if (/Linux/.test(userAgent)) return "Linux";
    return "Unknown Device";
  }

  /**
   * Helper method to get browser information
   */
  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (/Chrome/.test(userAgent)) return "Chrome";
    if (/Firefox/.test(userAgent)) return "Firefox";
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return "Safari";
    if (/Edg/.test(userAgent)) return "Edge";
    if (/MSIE|Trident/.test(userAgent)) return "Internet Explorer";
    return "Unknown Browser";
  }
}
