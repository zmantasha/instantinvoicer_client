"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/hooks/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router, user]);

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
  
      if (!accessToken) {
        toast.error("You are not logged in.", { position: "bottom-right" });
        router.replace("/account/login");
        return;
      }
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
  
      if (response.data && response.data.status === "success") {
        Cookies.remove("accessToken");
        toast.success("Successfully logged out.", { position: "bottom-right" });
        router.replace("/");
        setUser(null);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong while logging out.", { position: "bottom-right" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Blogs', href: '/admin/blogs' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Users', href: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-white bg-blue-700 px-4 py-2 rounded-md shadow-sm">InstantInvoicer</h1>
          </Link>
          <h2 className="text-lg font-medium text-gray-600 mt-3 ml-1 tracking-wide">Admin Panel</h2>
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

        {/* Admin Profile Section */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Admin"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-blue-600 font-medium">
                    {user?.firstName?.[0] || 'A'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Link href="/admin/myaccount">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FiSettings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <FiLogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 