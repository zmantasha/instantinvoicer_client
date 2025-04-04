"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Cookies from 'js-cookie';
import Image from 'next/image';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  banner: string;
  description: string;
  content: string;
  tags: string[];
  category: {
    _id: string;
    name: string;
  } | string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
  status: 'draft' | 'published';
  meta_title?: string;
  meta_description?: string;
  schema?: Array<{
    question: string;
    answer: string;
  }>;
}

const EditBlog = () => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [blog, setBlog] = useState<Blog | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [bannerPreview, setBannerPreview] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<'none' | 'faq'>('none');
  const [faqQuestions, setFaqQuestions] = useState<Array<{ question: string; answer: string }>>([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          router.push('/admin/login');
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          }
        );

        if (response.data && response.data.data && response.data.data.blog) {
          const blogData = response.data.data.blog;
          setBlog(blogData);
          setTitle(blogData.title);
          setDescription(blogData.description);
          setContent(blogData.content);
          setTags(blogData.tags || []);
          setSelectedCategory(blogData.category?._id || blogData.category || '');
          setSelectedAuthor(blogData.author?._id || blogData.author || '');
          setStatus(blogData.status);
          setBannerPreview(blogData.banner);
          setMetaTitle(blogData.meta_title || '');
          setMetaDescription(blogData.meta_description || '');
          setSelectedSchema(blogData.schema ? 'faq' : 'none');
          setFaqQuestions(blogData.schema || []);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      const blogData = {
        title,
        description,
        content,
        tags,
        category: selectedCategory,
        author: selectedAuthor,
        status,
        banner: bannerPreview,
        meta_title: metaTitle,
        meta_description: metaDescription,
        schema: selectedSchema === 'faq' ? faqQuestions : undefined
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/${params.id}`,
        blogData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );

      if (response.data && response.data.data && response.data.data.blog) {
        setSuccess('Blog updated successfully!');
        setTimeout(() => {
          router.push('/admin/blogs');
        }, 2000);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (error.response?.status === 400) {
          setError(error.response.data.error || 'Invalid blog data');
        } else {
          setError('Failed to update blog. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  // ... rest of the component code ...

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8">Edit Blog</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ... rest of the form ... */}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBlog; 