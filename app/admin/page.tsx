"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useUser } from '@/hooks/UserContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalUsers: number;
  totalCategories: number;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalUsers: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        router.push('/account/login');
        return;
      }

      const [blogsResponse, usersResponse, categoriesResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/category/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      ]);

      // Safely handle the data and set stats
      const allBlogs = blogsResponse?.data?.data?.blogs || [];
      const users = usersResponse?.data?.data || [];
      const categories = categoriesResponse?.data?.data?.categories || [];

      // Filter blogs to show only admin's blogs
      const adminBlogs = allBlogs.filter((blog: any) => blog.author?._id === user?._id);

      setStats({
        totalBlogs: adminBlogs.length,
        publishedBlogs: adminBlogs.filter((blog: any) => blog.status === 'published').length,
        draftBlogs: adminBlogs.filter((blog: any) => blog.status === 'draft').length,
        totalUsers: users.length,
        totalCategories: categories.length
      });

      // Set the data for the tables
      setBlogs(adminBlogs);
      setUsers(users);
      setCategories(categories);

    } catch (error) {
      console.error('Error fetching data:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/account/login');
          return;
        }
        setError(error.response?.data?.message || 'Failed to fetch data');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        router.push('/account/login');
        return;
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/${blogId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update the blogs state by filtering out the deleted blog
      setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId));
      
      // Update the stats
      setStats(prevStats => ({
        ...prevStats,
        totalBlogs: prevStats.totalBlogs - 1,
        publishedBlogs: prevStats.publishedBlogs - (blogs.find(blog => blog._id === blogId)?.status === 'published' ? 1 : 0),
        draftBlogs: prevStats.draftBlogs - (blogs.find(blog => blog._id === blogId)?.status === 'draft' ? 1 : 0)
      }));

      toast.success('Blog deleted successfully');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="mt-2 text-gray-600">Here's what's happening with your blog platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Blogs</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalBlogs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900">Published Blogs</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.publishedBlogs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900">Draft Blogs</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.draftBlogs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/blogs/create"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">Create New Blog</h3>
                <p className="text-sm text-blue-700">Start writing a new blog post</p>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-900">Manage Categories</h3>
                <p className="text-sm text-green-700">Organize your blog categories</p>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-purple-900">Manage Users</h3>
                <p className="text-sm text-purple-700">View and manage user accounts</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Blog Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Blogs</h2>
              <Link
                href="/admin/blogs/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Create New Blog
              </Link>
            </div>
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't created any blogs yet.</p>
                <Link
                  href="/admin/blogs/create"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first blog
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blogs.map((blog) => (
                      <tr key={blog._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {blog.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {blog.category?.name || 'Uncategorized'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              blog.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <Link
                              href={`/admin/blogs/${blog.slug}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEye className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/admin/blogs/edit/${blog.slug}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{stats.publishedBlogs} blogs published this month</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{stats.draftBlogs} draft blogs pending review</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>{stats.totalUsers} total users registered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 