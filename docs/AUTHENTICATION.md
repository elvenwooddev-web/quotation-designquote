# Authentication Setup Guide

## Overview

The intelli-quoter application uses **Supabase Authentication** integrated with a custom user profile system. This provides secure authentication while maintaining role-based access control.

## Architecture

### Components

1. **Supabase Auth** - Handles user authentication (sign up, sign in, sessions)
2. **Users Table** - Stores user profiles with roles and permissions
3. **Auth Context** - React context providing auth state throughout the app
4. **Middleware** - Protects routes from unauthenticated access

### Authentication Flow

```
┌─────────────┐
│   Sign Up   │
└──────┬──────┘
       │
       ├─1─> Create Supabase Auth User
       │
       ├─2─> Create User Profile in users table
       │     (with authuserid linking to auth user)
       │
       └─3─> Auto sign-in and redirect to dashboard

┌─────────────┐
│   Sign In   │
└──────┬──────┘
       │
       ├─1─> Authenticate with Supabase
       │
       ├─2─> Fetch user profile from users table
       │
       ├─3─> Store session in AuthContext
       │
       └─4─> Redirect to dashboard
```

## Setup Instructions

### 1. Enable Email Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email templates (optional)
5. Set up email confirmations if desired

### 2. Database Setup

The `users` table must have the following columns:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  authuserid TEXT UNIQUE,  -- Links to Supabase auth.users.id
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Designer', 'Client')),
  isactive BOOLEAN DEFAULT true,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** The database migration was already run to ensure lowercase column names.

### 3. Environment Variables

Ensure these are set in `.env` or `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Sign Up New Users

```typescript
import { useAuth } from '@/lib/auth-context';

const { signUp } = useAuth();

await signUp(email, password, {
  name: 'John Doe',
  role: 'Designer'
});
```

### Sign In

```typescript
import { useAuth } from '@/lib/auth-context';

const { signIn } = useAuth();

await signIn(email, password);
```

### Sign Out

```typescript
import { useAuth } from '@/lib/auth-context';

const { signOut } = useAuth();

await signOut();
```

### Access Current User

```typescript
import { useAuth } from '@/lib/auth-context';

const { user, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (!user) return <div>Not authenticated</div>;

return <div>Welcome, {user.name}!</div>;
```

### Check Permissions

```typescript
import { hasPermission } from '@/lib/permissions';

const canEdit = hasPermission(user.role, 'products', 'canEdit');

if (canEdit) {
  // Show edit button
}
```

## Demo Mode

For development and testing, the login page includes a "Demo Mode" checkbox:

1. Check "Demo Mode" on login page
2. Enter any demo user email (e.g., `sophia.carter@email.com`)
3. Password field is hidden - no password required
4. User profile is fetched directly from database
5. Session is stored in localStorage

**Demo Users:**
- **Admin**: sophia.carter@email.com
- **Designer**: ethan.bennett@email.com, olivia.hayes@email.com
- **Client**: liam.foster@email.com, ava.morgan@email.com

## Route Protection

All routes except `/login` and `/signup` are protected by middleware.

**Middleware** ([middleware.ts](../middleware.ts)):
- Checks for Supabase session cookie
- Redirects to `/login` if not authenticated
- Preserves original URL for post-login redirect
- Allows demo mode via localStorage

## Security Considerations

### Production Checklist

- [ ] Disable demo mode in production
- [ ] Enable email confirmation for sign-ups
- [ ] Set up Row Level Security (RLS) policies in Supabase
- [ ] Configure proper CORS settings
- [ ] Use environment-specific Supabase keys
- [ ] Set up password reset flow
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CAPTCHA to prevent bot signups
- [ ] Enable MFA (Multi-Factor Authentication) for admin users

### Row Level Security (RLS)

Recommended RLS policies for `users` table:

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = authuserid);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = authuserid);

-- Only admins can insert users (via service role)
-- Only admins can delete users (via service role)
```

## Troubleshooting

### "User not found" after signup

**Cause**: User profile wasn't created in `users` table
**Solution**: Check that the signup function creates both auth user and profile

### Session not persisting

**Cause**: Cookies not being set properly
**Solution**:
- Check that your domain is properly configured
- Ensure Supabase URL is correct in environment variables
- Clear browser cookies and try again

### Middleware redirecting to login constantly

**Cause**: Session cookie name might be incorrect
**Solution**: Check the cookie names in middleware.ts match your Supabase setup

### Demo mode not working

**Cause**: Demo users don't exist in database or have wrong email
**Solution**:
- Run database check: `node scripts/check-database.js`
- Verify demo users exist with correct emails
- Check that `isactive` is true for demo users

## API Reference

### AuthContext

```typescript
interface AuthContextType {
  user: User | null;           // Current authenticated user
  loading: boolean;            // Loading state
  signIn: (email, password) => Promise<void>;
  signUp: (email, password, userData) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### User Type

```typescript
interface User {
  id: string;
  authuserid: string | null;
  name: string;
  email: string;
  role: 'Admin' | 'Designer' | 'Client';
  isactive: boolean;
  createdat: Date | string;
  updatedat: Date | string;
}
```

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification requirement
- [ ] Social auth providers (Google, GitHub)
- [ ] Session timeout warnings
- [ ] Activity logging
- [ ] User invitation system
- [ ] Role change workflow with approval
- [ ] Account deletion with data retention policy

---

**Last Updated**: 2025-10-19
**Maintained By**: Development Team
