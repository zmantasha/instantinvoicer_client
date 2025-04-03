"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/UserContext';
import dynamic from 'next/dynamic';
import Image from 'next/image';

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

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: ContentSection[];
  tags: string[];
  category: string;
  status: 'draft' | 'published';
  banner: string;
  meta_title: string;
  meta_description: string;
}

const BlogEditor = ({ params }: { params: { id: string } }) => {
  const { user, isAdmin } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
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

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchCategories();
    fetchBlog();
  }, [isAdmin, router, params.id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/category/`);
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/${params.id}`);
      const blog: Blog = response.data.data.blog;
      
      setTitle(blog.title);
      setDescription(blog.description);
      setContent(blog.content);
      setTags(blog.tags);
      setSelectedCategory(blog.category);
      setStatus(blog.status);
      setBannerPreview(blog.banner);
      setMetaTitle(blog.meta_title || '');
      setMetaDescription(blog.meta_description || '');

      // Check for FAQ schema
      const faqSection = blog.content.find(section => section.type === 'faq');
      if (faqSection && faqSection.questions) {
        setSelectedSchema('faq');
        setFaqQuestions(faqSection.questions);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
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
    setSaving(true);

    try {
      // Upload banner image if exists
      let bannerUrl = bannerPreview;
      if (banner) {
        const formData = new FormData();
        formData.append('image', banner);
        const uploadResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/upload/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        bannerUrl = uploadResponse.data.data.url;
      }

      // Prepare blog data
      const blogData = {
        title,
        description,
        content,
        tags,
        category: selectedCategory,
        status,
        banner: bannerUrl,
        meta_title: metaTitle,
        meta_description: metaDescription,
      };

      // Add FAQ schema if selected
      if (selectedSchema === 'faq' && faqQuestions.length > 0) {
        const existingFaqIndex = blogData.content.findIndex(section => section.type === 'faq');
        if (existingFaqIndex !== -1) {
          blogData.content[existingFaqIndex] = {
            type: 'faq',
            questions: faqQuestions,
          };
        } else {
          blogData.content.push({
            type: 'faq',
            questions: faqQuestions,
          });
        }
      }

      // Update blog
      await axios.put(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/blog/${params.id}`, blogData);

      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8">Edit Blog</h1>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                onChange={(value: string) => {
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
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/blogs')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor; 