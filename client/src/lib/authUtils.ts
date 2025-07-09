// Authentication utility functions for production OAuth integration

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function handleAuthError(error: Error, toast?: any) {
  if (isUnauthorizedError(error)) {
    if (toast) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
    return true;
  }
  return false;
}

export function getAuthHeaders(): Record<string, string> {
  // In production, this would include Authorization headers
  // For now, credentials are handled via cookies
  return {};
}