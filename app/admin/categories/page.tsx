"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/hooks/UserContext';
import Cookies from 'js-cookie';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

const CategoriesPage = () => {
  const { user, isAdmin } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/category/`);
      
      // Check if response has the expected structure
      if (response.data && response.data.data) {
        // Handle both possible response structures
        const categoriesData = response.data.data.categories || response.data.data;
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.map(category => ({
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description || ''
          })));
        } else {
          console.error('Invalid categories data format:', categoriesData);
          setError('Invalid categories data format received from server');
        }
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError('Failed to fetch categories. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      // Validate category name
      if (!newCategory.name || newCategory.name.trim() === '') {
        setError('Category name is required');
        return;
      }

      // Create category data with proper slug
      const categoryData = {
        name: newCategory.name.trim(),
        slug: newCategory.name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: newCategory.description || ''
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/category/`,
        categoryData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );

      console.log('Create category response:', response.data);

      // Handle different possible response structures
      let newCategoryData;
      if (response.data && response.data.data) {
        // Try different possible response structures
        newCategoryData = response.data.data.category || response.data.data;
      } else if (response.data) {
        // If data is directly in response.data
        newCategoryData = response.data;
      }

      if (newCategoryData && newCategoryData._id) {
        // Ensure all required fields are present
        const categoryToAdd = {
          _id: newCategoryData._id,
          name: newCategoryData.name || categoryData.name,
          slug: newCategoryData.slug || categoryData.slug,
          description: newCategoryData.description || categoryData.description
        };

        setCategories(prevCategories => [...prevCategories, categoryToAdd]);
        setNewCategory({ name: '', description: '' });
        setError(null);
        setSuccess('Category created successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.error('Invalid category data received:', newCategoryData);
        throw new Error('Invalid category data received from server');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (error.response?.status === 400) {
          setError(error.response.data.error || 'Invalid category data');
        } else {
          setError('Failed to create category. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      // Create updated category data with proper slug
      const updatedCategory = {
        ...editingCategory,
        slug: editingCategory.name.trim().toLowerCase().replace(/\s+/g, '-')
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/category/${editingCategory._id}`,
        updatedCategory,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCategories(categories.map(cat => 
        cat._id === editingCategory._id ? response.data.data.category : cat
      ));
      setEditingCategory(null);
      setError(null);
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/category/${categoryId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCategories(categories.filter(cat => cat._id !== categoryId));
      setError(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Create Category Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Category</h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategory && editingCategory._id === category._id ? (
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {editingCategory && editingCategory._id === category._id ? (
                        <textarea
                          value={editingCategory.description || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          rows={2}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{category.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingCategory && editingCategory._id === category._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateCategory}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 