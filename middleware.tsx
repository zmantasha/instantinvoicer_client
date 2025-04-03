import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const authPaths = ['/account/login', '/account/signup'];
const protectedPaths = ['/user/:path*'];

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const path = request.nextUrl.pathname;

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(pattern => {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return regex.test(path);
  });

  try {
    if (token) {
      // Call the profile API to verify the token
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If user is authenticated and tries to access auth paths, redirect to dashboard
      if (authPaths.includes(path)) {
        return NextResponse.redirect(new URL('/user/myinvoice', request.url));
      }

      // If user is authenticated and accessing protected path, allow access
      if (isProtectedPath) {
        return NextResponse.next();
      }
    } else {
      // No token available
      if (isProtectedPath || !authPaths.includes(path)) {
        return NextResponse.redirect(new URL('/account/login', request.url));
      }
    }
  } catch (error: any) {
    console.error('Authentication failed:', error.message);

    // If the API returns 401 or any other error, clear the cookie and redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      const response = NextResponse.redirect(new URL('/account/login', request.url));
      response.cookies.set('accessToken', '', { 
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      }); // Clear the cookie with proper security settings
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*', '/account/login', '/account/signup'],
};
