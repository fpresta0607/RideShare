import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function DemoLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Demo credentials check
    if (username === "franco" && password === "presta") {
      // Set demo user in localStorage
      localStorage.setItem('demoUser', JSON.stringify({
        id: '999',
        name: 'Franco Presta',
        email: 'franco@example.com',
        phoneNumber: '+1 (555) 123-4567',
        preferredPayment: 'card',
        totalSavings: '47.85',
        totalTimeSaved: 78,
        totalRides: 15,
        memberSince: new Date(Date.now() - 7776000000).toISOString() // 3 months ago
      }));
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
        setIsLoading(false);
      }, 1000);
    } else {
      setError("Invalid username or password. Use demo credentials: franco / presta");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Demo Login
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600">
            Try RideCompare with demo credentials
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Username:</strong> franco</div>
              <div><strong>Password:</strong> presta</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/api/login'}
              className="text-sm"
            >
              Use Real Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}