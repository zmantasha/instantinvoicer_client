import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const authPaths = ['/account/login', '/account/signup'];
const protectedPaths = ['/user', '/admin'];

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const path = request.nextUrl.pathname;

  // Always allow access to auth paths
  if (authPaths.includes(path)) {
    return NextResponse.next();
  }

  try {
    if (token) {
      // Call the profile API to verify the token
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.user;
      const isAdmin = user?.roles?.includes('admin');

      // Protect admin routes
      if (path.startsWith('/admin') && !isAdmin) {
        return NextResponse.redirect(new URL('/user/myinvoice', request.url));
      }

      // Protect user routes
      if (path.startsWith('/user') && isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      return NextResponse.next();
    } else {
      // No token available, redirect to login if trying to access protected paths
      if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
        return NextResponse.redirect(new URL('/account/login', request.url));
      }
    }
  } catch (error: any) {
    console.error('Authentication failed:', error.message);

    // If the API returns 401, clear the cookie and redirect to login
    if (error.response?.status === 401) {
      const response = NextResponse.redirect(new URL('/account/login', request.url));
      response.cookies.set('accessToken', '', { maxAge: 0 }); // Clear the cookie
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/admin/:path*',
    '/account/login',
    '/account/signup',
  ],
};
