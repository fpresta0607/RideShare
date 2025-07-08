import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check for demo user in localStorage
  const demoUser = localStorage.getItem('demoUser');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // If demo user exists, use that instead of real auth
  if (demoUser) {
    return {
      user: JSON.parse(demoUser),
      isLoading: false,
      isAuthenticated: true,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}