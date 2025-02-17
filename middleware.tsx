import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const authPaths = ['/account/login', '/account/signup'];

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


      // If the user is already authenticated and tries to access auth paths, redirect
      if (authPaths.includes(path)) {
        return NextResponse.redirect(new URL('/user/myinvoice', request.url));
      }
    } else {
      // No token available
      console.log('No token found');
      if (!authPaths.includes(path)) {
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
  matcher: ['/user/:path*', '/account/login', '/account/signup'],
};
