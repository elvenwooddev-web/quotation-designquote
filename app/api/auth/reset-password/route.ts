import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send password reset email via Supabase Auth
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('[Auth] Password reset error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send password reset email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset email sent successfully',
      data
    });

  } catch (error: any) {
    console.error('[Auth] Exception in reset-password:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
