"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useUser } from '@/hooks/UserContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface Stats {
  total_blogs: number;
  published_blogs: number;
  draft_blogs: number;
  total_users: number;
  total_categories: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useUser();
  const [stats, setStats] = useState<Stats>({
    total_blogs: 0,
    published_blogs: 0,
    draft_blogs: 0,
    total_users: 0,
    total_categories: 0
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          router.push('/account/login');
          return;
        }

        // Fetch blogs
        const blogsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Fetch users
        const usersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Fetch categories
        const categoriesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/category`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Safely extract data from responses
        const blogs = blogsResponse.data?.data?.blogs || [];
        const users = usersResponse.data?.data || [];
        const categories = categoriesResponse.data?.data?.categories || [];

        setStats({
          total_blogs: blogs.length,
          published_blogs: blogs.filter((blog: any) => blog.status === 'published').length,
          draft_blogs: blogs.filter((blog: any) => blog.status === 'draft').length,
          total_users: users.length,
          total_categories: categories.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      }
    };

    if (!loading && isAdmin) {
      fetchData();
    }
  }, [loading, isAdmin, router]);

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Blogs</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_blogs}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Published Blogs</h3>
            <p className="text-3xl font-bold text-green-600">{stats.published_blogs}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Draft Blogs</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.draft_blogs}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.total_users}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Categories</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.total_categories}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 