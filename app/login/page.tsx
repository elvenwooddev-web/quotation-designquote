'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  // Load saved email if "Remember Me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isDemo) {
        // For demo purposes, bypass password check
        const demoUsers = [
          'sophia.carter@email.com',
          'ethan.bennett@email.com',
          'olivia.hayes@email.com',
          'liam.foster@email.com',
          'ava.morgan@email.com'
        ];

        if (demoUsers.includes(email)) {
          // Simulate demo login by fetching user profile directly
          const response = await fetch('/api/users');
          const data = await response.json();

          // Check if the response is an error
          if (!response.ok || data.error) {
            throw new Error(data.error || 'Failed to fetch users');
          }

          // Ensure data is an array
          const users = Array.isArray(data) ? data : [];
          const user = users.find((u: any) => u.email === email);

          if (!user) {
            throw new Error('User not found');
          }

          if (!user.isactive) {
            throw new Error('Account is deactivated');
          }

          // Set user in localStorage for demo purposes
          localStorage.setItem('demo_user', JSON.stringify(user));

          // Save email if "Remember Me" is checked
          if (rememberMe) {
            localStorage.setItem('remembered_email', email);
          } else {
            localStorage.removeItem('remembered_email');
          }

          window.location.reload();
        } else {
          throw new Error('Demo user not found');
        }
      } else {
        await signIn(email, password);

        // Save email if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to access your DesignQuote account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <label htmlFor="demo-mode" className="text-sm font-medium text-amber-800 cursor-pointer">
              Demo Mode (bypass password)
            </label>
            <input
              type="checkbox"
              id="demo-mode"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          {!isDemo && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              id="remember-me"
            />
            <label
              htmlFor="remember-me"
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Demo Users Info */}
        {isDemo && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-semibold mb-3">Available Demo Users:</p>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="font-medium">Admin:</span>
                <span className="text-gray-600">sophia.carter@email.com</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="font-medium">Designer:</span>
                <span className="text-gray-600">ethan.bennett@email.com</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="font-medium">Designer:</span>
                <span className="text-gray-600">olivia.hayes@email.com</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="font-medium">Client:</span>
                <span className="text-gray-600">liam.foster@email.com</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="font-medium">Client:</span>
                <span className="text-gray-600">ava.morgan@email.com</span>
              </div>
            </div>
          </div>
        )}

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
