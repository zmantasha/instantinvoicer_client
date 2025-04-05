"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiArrowLeft, FiEye, FiTrash2 } from 'react-icons/fi';

interface Blog {
  _id: string;
  title: string;
  content: string;
  banner: string;
  status: string;
  slug: string;
  category: {
    name: string;
  };
  author: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function BlogDetail({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        router.push('/account/login');
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/slug/${params.slug}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setBlog(response.data.data);
      } else {
        setError('Blog not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/account/login');
          return;
        }
        setError(error.response?.data?.message || 'Failed to fetch blog');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      setIsDeleting(true);
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        router.push('/account/login');
        return;
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/${blog?._id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast.success('Blog deleted successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Blog Banner */}
          <div className="relative h-96 w-full">
            <Image
              src={blog.banner || '/default-banner.jpg'}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Blog Content */}
          <div className="p-6">
            {/* Blog Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={blog.author.avatar || '/default-avatar.jpg'}
                    alt={`${blog.author.firstName} ${blog.author.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {blog.author.firstName} {blog.author.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                blog.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {blog.status}
              </span>
            </div>

            {/* Blog Title and Category */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {blog.category?.name || 'Uncategorized'}
              </span>
            </div>

            {/* Blog Content */}
            <div className="prose max-w-none prose-lg">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href={`/admin/blogs/edit/${blog.slug}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Blog
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Blog'}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 