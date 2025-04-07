"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/hooks/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("AdminLayout useEffect triggered:", { isAdmin, loading, user });
    if (!loading && !isAdmin) {
      console.log("Redirecting to home page - not admin");
      router.push('/');
    }
  }, [isAdmin, loading, router, user]);

  if (loading) {
    console.log("AdminLayout: Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log("AdminLayout: Not admin, returning null");
    return null;
  }

  console.log("AdminLayout: Rendering admin layout");

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Blogs', href: '/admin/blogs' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Users', href: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user?.firstName?.[0] || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 py-6 px-4 md:px-6 lg:px-8 overflow-y-auto">
          {children}
        </main>
        
        {/* Admin Footer */}
        <footer className="bg-white border-t py-4 px-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Instant Invoicer Admin Panel</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout; 