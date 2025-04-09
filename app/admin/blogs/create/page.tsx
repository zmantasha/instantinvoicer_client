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
  } | string;
  status: 'draft' | 'published';
  meta_title?: string;
  meta_description?: string;
  schema?: Array<{
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
  const [content, setContent] = useState<string>(''); // Changed to string to handle HTML content
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
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [authors, setAuthors] = useState<Array<{ _id: string; firstName: string; lastName: string }>>([]);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchCategories();
  }, [isAdmin, router]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) return;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/authors`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          }
        );
  console.log("response",response.data.authors)
        if (response.data && response.data && response.data.authors) {
          setAuthors(response.data.authors);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchAuthors();
  }, []);

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
    try {
      setLoading(true);
      setError(null);
      
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      if (!title || !description || !content || !selectedCategory) {
        setError('Please fill in all required fields');
        return;
      }

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Create blog data with all fields
      const blogData = {
        title,
        description,
        content,
        tags,
        category: selectedCategory,
        status,
        banner: bannerPreview || '',
        meta_title: metaTitle || title,
        meta_description: metaDescription || description,
        schema: selectedSchema === 'faq' ? faqQuestions : undefined,
        slug
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/create`,
        blogData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );

      if (response.data && response.data.success) {
        setSuccess('Blog created successfully!');
        setTimeout(() => {
          router.push('/admin/blogs');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create blog. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the toolbar options for the editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'indent',
    'align',
    'link', 'image', 'video'
  ];

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

              {/* Author Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an author</option>
                  {authors.map((author) => (
                    <option key={author._id} value={author._id}>
                      {author.firstName} {author.lastName}
                    </option>
                  ))}
                </select>
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
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="h-96 mb-12"
                theme="snow"
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