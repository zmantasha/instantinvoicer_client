import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const authPaths = ['/account/login', '/account/signup'];
const protectedPaths = ['/user', '/admin', '/account'];

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const path = request.nextUrl.pathname;

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

      // If the user is already authenticated and tries to access auth paths, redirect based on role
      if (authPaths.includes(path)) {
        const redirectPath = isAdmin ? '/admin' : '/user/myinvoice';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }

      // Protect admin routes
      if (path.startsWith('/admin') && !isAdmin) {
        return NextResponse.redirect(new URL('/user/myinvoice', request.url));
      }

      // Protect user routes
      if (path.startsWith('/user') && isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Allow access to protected paths
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
    '/account/:path*',
    '/user/invoicetamplate', // Add the typo path to ensure it's caught
  ],
};
