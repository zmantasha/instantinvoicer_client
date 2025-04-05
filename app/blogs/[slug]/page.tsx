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
  content: string; // Changed to string to handle HTML content
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
              <div className="text-sm text-gray-500">
                By {blog.author?.firstName} {blog.author?.lastName}
              </div>
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
              <div className="prose prose-lg max-w-none">
                {blog.content && (
                  <div 
                    className="blog-content"
                    dangerouslySetInnerHTML={{ 
                      __html: typeof blog.content === 'string' 
                        ? blog.content 
                        : Array.isArray(blog.content)
                          ? blog.content.map((section:any) => {
                              if (typeof section === 'string') {
                                return section;
                              } else if (typeof section === 'object' && section !== null) {
                                if (section.type === 'paragraph' && section.text) {
                                  return `<p>${section.text}</p>`;
                                } else if (section.type === 'heading' && section.text) {
                                  return `<h2>${section.text}</h2>`;
                                }
                              }
                              return '';
                            }).join('')
                          : JSON.stringify(blog.content)
                    }} 
                  />
                )}
              </div>
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

      <style jsx global>{`
        .blog-content {
          font-family: inherit;
          white-space: normal;
        }
        .blog-content h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h2 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
        }
        .blog-content h3 {
          font-size: 1.75rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content h4 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
        }
        .blog-content h5 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .blog-content h6 {
          font-size: 1rem;
          font-weight: bold;
          margin-top: 0.875rem;
          margin-bottom: 0.4375rem;
        }
        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          white-space: normal;
        }
        .blog-content ul, .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
          list-style-position: outside;
        }
        .blog-content ul {
          list-style-type: disc;
        }
        .blog-content ol {
          list-style-type: decimal;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          white-space: normal;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 0.5rem;
        }
        .blog-content iframe {
          width: 100%;
          min-height: 400px;
          margin: 2rem 0;
          border-radius: 0.5rem;
        }
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .blog-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
        }
        /* Fix for Quill editor content */
        .blog-content .ql-align-center {
          text-align: center;
        }
        .blog-content .ql-align-right {
          text-align: right;
        }
        .blog-content .ql-align-justify {
          text-align: justify;
        }
        .blog-content .ql-indent-1 {
          margin-left: 3em;
        }
        .blog-content .ql-indent-2 {
          margin-left: 6em;
        }
        .blog-content .ql-indent-3 {
          margin-left: 9em;
        }
        .blog-content .ql-indent-4 {
          margin-left: 12em;
        }
        .blog-content .ql-indent-5 {
          margin-left: 15em;
        }
        .blog-content .ql-indent-6 {
          margin-left: 18em;
        }
        .blog-content .ql-indent-7 {
          margin-left: 21em;
        }
        .blog-content .ql-indent-8 {
          margin-left: 24em;
        }
      `}</style>
    </div>
  );
};

export default BlogPost; 