"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  banner: string;
  description: string;
  content: string[];
  tags: string[];
  author: {
    name: string;
    email: string;
  };
  activity: {
    total_likes: number;
    total_comments: number;
    total_reads: number;
  };
}

const BlogSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/`);
      setBlogs(response.data.data.blogs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  const displayedBlogs = showAll ? blogs : blogs.slice(0, 2);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading...</div>;
  }

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Latest Blogs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedBlogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={blog.banner || '/placeholder-blog.jpg'}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{blog.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>By {blog.author?.name || 'Anonymous'}</span>
                <span>{blog.activity.total_reads} reads</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {blogs.length > 2 && !showAll && (
        <div className="text-center mt-8">
          <Link
            href="/blogs"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            More Blogs
          </Link>
        </div>
      )}
    </section>
  );
};

export default BlogSection; 