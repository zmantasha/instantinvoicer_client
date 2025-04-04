"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/UserContext';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { slugify } from '@/utils/slugify';

// Dynamically import the rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface ContentSection {
  type: 'heading' | 'paragraph' | 'image' | 'faq';
  text?: string;
  id?: string;
  src?: string;
  alt?: string;
  questions?: Array<{
    question: string;
    answer: string;
  }>;
}

const BlogEditor = () => {
  const { user, isAdmin } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState<ContentSection[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<'none' | 'faq'>('none');
  const [faqQuestions, setFaqQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchCategories();
  }, [isAdmin, router]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/category/`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        throw new Error('Invalid categories data format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Failed to load categories. Please try again later.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddFaqQuestion = () => {
    setFaqQuestions([...faqQuestions, { question: '', answer: '' }]);
  };

  const handleUpdateFaqQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedQuestions = [...faqQuestions];
    updatedQuestions[index][field] = value;
    setFaqQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Upload banner image if exists
      let bannerUrl = banner;
      if (banner instanceof File) {
        const formData = new FormData();
        formData.append('image', banner);
        const uploadResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/upload/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true
          }
        );
        bannerUrl = uploadResponse.data.data.url;
      }

      // Generate a unique slug by appending timestamp if needed
      let finalSlug = slugify(title);
      try {
        // First try with the original slug
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/create`,
          {
            blog_id: `B${Date.now().toString().slice(-4)}`,
            title,
            slug: finalSlug,
            description,
            content,
            tags,
            category: selectedCategory,
            status,
            banner: bannerUrl,
            meta_title: metaTitle,
            meta_description: metaDescription,
            schema: selectedSchema === 'faq' ? faqQuestions : undefined
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true
          }
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.message?.includes('already exists')) {
          // If slug exists, append timestamp
          finalSlug = `${slugify(title)}-${Date.now()}`;
          // Try again with the new slug
          await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/create`,
            {
              blog_id: `B${Date.now().toString().slice(-4)}`,
              title,
              slug: finalSlug,
              description,
              content,
              tags,
              category: selectedCategory,
              status,
              banner: bannerUrl,
              meta_title: metaTitle,
              meta_description: metaDescription,
              schema: selectedSchema === 'faq' ? faqQuestions : undefined
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true
            }
          );
        } else {
          throw error;
        }
      }

      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create blog');
      } else {
        setError('Failed to create blog');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8">Create New Blog</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                {categoriesLoading ? (
                  <div className="w-full px-4 py-2 border rounded-md bg-gray-100 animate-pulse">
                    Loading categories...
                  </div>
                ) : categoriesError ? (
                  <div className="w-full px-4 py-2 border rounded-md bg-red-50 text-red-600">
                    {categoriesError}
                  </div>
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {bannerPreview && (
                  <div className="mt-2 relative h-32 w-full">
                    <Image
                      src={bannerPreview}
                      alt="Banner preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleAddTag}
                placeholder="Press Enter to add tag"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <ReactQuill
                value={content.map(section => section.text || '').join('\n')}
                onChange={(value) => {
                  const sections = value.split('\n').map(text => ({
                    type: 'paragraph' as const,
                    text,
                  }));
                  setContent(sections);
                }}
                className="h-96 mb-12"
              />
            </div>

            {/* Schema Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schema</label>
              <select
                value={selectedSchema}
                onChange={(e) => setSelectedSchema(e.target.value as 'none' | 'faq')}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Schema</option>
                <option value="faq">FAQ Schema</option>
              </select>

              {selectedSchema === 'faq' && (
                <div className="mt-4 space-y-4">
                  {faqQuestions.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaqQuestion(index, 'question', e.target.value)}
                        placeholder="Question"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaqQuestion(index, 'answer', e.target.value)}
                        placeholder="Answer"
                        rows={3}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFaqQuestion}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Add FAQ Question
                  </button>
                </div>
              )}
            </div>

            {/* SEO Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">SEO Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor; 