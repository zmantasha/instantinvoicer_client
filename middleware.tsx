// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPaths = ['/account/login', '/account/signup'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const path = request.nextUrl.pathname;

  // Handle token expiration
  if (token && !authPaths.includes(path)) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`,
        
        {
           credentials: 'include',
           headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Invalid token');
    } catch (error) {
      const response = NextResponse.redirect(new URL('/account/login', request.url));
      response.cookies.delete('accessToken');
      response.headers.set('x-clear-storage', 'true');
      return response;
    }
  }

  // Handle unauthenticated access
  if (!token && !authPaths.includes(path)) {
    return NextResponse.redirect(new URL('/account/login', request.url));
  }

  // Handle authenticated users trying to access auth pages
  if (token && authPaths.includes(path)) {
    return NextResponse.redirect(new URL('/user/invoicetamplate', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*', '/account/login', '/account/signup'],
};