"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/hooks/UserContext';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  banner: string;
  description: string;
  content: any;
  tags: string[];
  category: {
    _id: string;
    name: string;
  } | string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  status: 'draft' | 'published' | 'archived';
  activity: {
    total_likes: number;
    total_comments: number;
    total_reads: number;
  };
  meta_title?: string;
  meta_description?: string;
}

interface ProcessedBlog extends Omit<Blog, 'category' | 'author'> {
  category: {
    _id: string;
    name: string;
  };
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AdminBlogs = () => {
  const { user, isAdmin } = useUser();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchBlogs();
  }, [isAdmin, router]);

  const processBlogData = (blog: Blog): ProcessedBlog => {
    return {
      ...blog,
      category: typeof blog.category === 'string' 
        ? { _id: '', name: blog.category || 'Uncategorized' }
        : blog.category,
      author: typeof blog.author === 'string'
        ? { _id: '', firstName: '', lastName: '', email: '' }
        : blog.author,
      activity: blog.activity || { total_likes: 0, total_comments: 0, total_reads: 0 }
    };
  };

  const fetchBlogs = async (pageNum = 1) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/`, {
        params: {
          page: pageNum,
          limit: 10
        }
      });
      console.log('Raw blogs response:', response.data);
      
      if (response.data.success) {
        let newBlogs: Blog[] = [];
        
        // Handle different response formats
        if (Array.isArray(response.data.data)) {
          newBlogs = response.data.data;
        } else if (response.data.data?.blogs) {
          newBlogs = response.data.data.blogs;
        } else if (typeof response.data.data === 'object') {
          newBlogs = Object.values(response.data.data);
        }
        
        // Process each blog to ensure correct structure
        const processedBlogs = newBlogs.map(processBlogData);
        
        if (pageNum === 1) {
          setBlogs(processedBlogs);
        } else {
          setBlogs(prev => [...prev, ...processedBlogs]);
        }
        
        setHasMore(newBlogs.length === 10);
      } else {
        console.error('Failed to fetch blogs:', response.data);
        setBlogs([]);
      }
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBlogs(nextPage);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  console.log("filter",filteredBlogs)

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/${blogId}`);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <Link
            href="/admin/blogs/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Blog
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blogs..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBlogs.map((blog) => {
                // Safely handle category name
                const categoryName = typeof blog.category === 'string' 
                  ? blog.category 
                  : blog.category?.name || 'Uncategorized';

                // Safely handle author name
                const authorName = typeof blog.author === 'string'
                  ? blog?.author
                  : `${blog.author?.firstName || ''} ${blog.author?.lastName || ''}`.trim() || 'Unknown Author';

                const status = blog.status || 'draft';
                const views = blog.activity?.total_reads || 0;
                const likes = blog.activity?.total_likes || 0;
                const comments = blog.activity?.total_comments || 0;

                return (
                  <tr key={blog._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            src={blog.banner || '/placeholder-blog.jpg'}
                            alt={blog.title}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                          <div className="text-sm text-gray-500">{blog.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        status === 'published' ? 'bg-green-100 text-green-800' :
                        status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {authorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Views: {views}</div>
                      <div>Likes: {likes}</div>
                      <div>Comments: {comments}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          href={`/admin/blogs/edit/${blog._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs; 