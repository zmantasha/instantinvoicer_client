"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';

interface ContentSection {
  type: 'heading' | 'paragraph' | 'image';
  text?: string;
  id?: string;
  src?: string;
  alt?: string;
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  banner: string;
  description: string;
  content: any; // Changed to any since the content structure varies
  tags: string[];
  category: {
    name: string;
  };
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

const BlogPost = () => {
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    fetchBlog();
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      // Get all blogs without authentication
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/`);
      
      // Find the blog with matching slug
      const foundBlog = response.data.data.blogs.find((b: Blog) => b.slug === params.slug);
      if (foundBlog) {
        setBlog(foundBlog);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!blog) {
    return <div className="flex justify-center items-center min-h-screen">Blog not found</div>;
  }

  // Convert content array to sections if it's not already in the correct format
  const contentSections = Array.isArray(blog.content) 
    ? blog.content.map((item, index) => {
        if (typeof item === 'string') {
          return {
            type: 'paragraph',
            text: item,
            id: `section-${index}`
          };
        }
        return item;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={blog.banner || '/placeholder-blog.jpg'}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>
            <p className="text-xl md:text-2xl mb-8">{blog.description}</p>
            <div className="flex items-center justify-center gap-4">
              <span>By {blog.author?.name || 'Anonymous'}</span>
              <span>•</span>
              <span>{blog.activity.total_reads} reads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {contentSections.map((section, index) => (
                <div key={index} className="mb-8" id={section.id}>
                  {section.type === 'heading' && (
                    <h2 className="text-3xl font-bold mb-4">{section.text}</h2>
                  )}
                  {section.type === 'paragraph' && (
                    <p className="text-gray-700 leading-relaxed mb-6">{section.text}</p>
                  )}
                  {section.type === 'image' && section.src && section.alt && (
                    <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                      <Image
                        src={section.src}
                        alt={section.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table of Contents */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Table of Contents</h3>
              <ul className="space-y-2">
                {contentSections
                  .filter(section => section.type === 'heading' && section.id && section.text)
                  .map((section, index) => (
                    <li key={index}>
                      <a
                        href={`#${section.id}`}
                        className={`block py-2 px-4 rounded-md transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (section.id) {
                            setActiveSection(section.id);
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        {section.text}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost; 