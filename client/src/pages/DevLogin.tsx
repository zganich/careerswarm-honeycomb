import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      // Call test-login endpoint and store token
      const response = await fetch('/api/oauth/test-login');
      const data = await response.json();
      
      if (data.success && data.sessionToken) {
        // Store token in localStorage as fallback
        localStorage.setItem('dev_session_token', data.sessionToken);
        console.log('Dev session token stored');
        
        // Redirect to homepage
        window.location.href = '/';
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Dev login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Development Login</CardTitle>
          <CardDescription>
            Quick access for testing CareerSwarm features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Test Account</label>
            <Input 
              type="email" 
              value="test@careerswarm.com" 
              disabled 
              className="bg-slate-50"
            />
          </div>
          
          <Button 
            onClick={handleDevLogin}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600"
            size="lg"
          >
            {isLoading ? 'Signing in...' : 'Sign In as Test User'}
          </Button>

          <div className="text-xs text-slate-500 text-center pt-2">
            This is a development-only login for testing purposes.
            <br />
            For production, use the OAuth sign-in flow.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
