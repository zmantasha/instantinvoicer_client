"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useUser } from '@/hooks/UserContext';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  roles: string[];
  createdAt?: string;
  is_verified?: boolean;
}

const UsersPage = () => {
  const router = useRouter();
  const { user, isAdmin } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  const validateToken = () => {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      router.push('/admin/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializePage = async () => {
      if (!validateToken()) return;
      
      if (!isAdmin) {
        router.push('/');
        return;
      }

      try {
        await fetchUsers();
      } catch (error) {
        console.error('Error initializing page:', error);
        setError('Failed to initialize page');
      }
    };

    // Add a small delay to prevent rapid state updates
    timeoutId = setTimeout(() => {
      if (isMounted) {
        initializePage();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isAdmin, router]);

  const fetchUsers = async () => {
    if (!validateToken()) return;

    try {
      setLoading(true);
      setError(null);
      
      const accessToken = Cookies.get('accessToken');
      console.log('Fetching users with token:', accessToken ? 'Present' : 'Missing');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
          validateStatus: (status) => status < 500
        }
      );

      console.log('Users API response:', response.data);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status >= 400) {
        console.error('Server error response:', response.data);
        setError(`Server error: ${response.data?.message || 'Unknown error'}`);
        return;
      }

      // Check if we have the expected data structure
      if (!response.data?.data) {
        console.error('No data in response:', response.data);
        setError('No data received from server');
        return;
      }

      // The users array might be directly in response.data or in response.data.data
      const usersData = Array.isArray(response.data) ? response.data : 
                       Array.isArray(response.data.data) ? response.data.data : 
                       Array.isArray(response.data.data?.users) ? response.data.data.users : [];

      console.log('Extracted users data:', usersData);

      if (usersData.length === 0) {
        console.warn('No users found in response');
        setUsers([]);
        return;
      }

      // Validate each user object
      const validUsers = usersData.filter((user: any) => {
        // Basic validation for required fields
        const hasRequiredFields = user && 
                                typeof user._id === 'string' &&
                                typeof user.firstName === 'string' &&
                                typeof user.email === 'string';

        // Roles validation - ensure roles array exists and contains valid values
        const hasValidRoles = Array.isArray(user.roles) && 
                             user.roles.some((role: string) => ['user', 'admin'].includes(role));

        // If roles is missing or empty, add default role
        if (hasRequiredFields && (!user.roles || user.roles.length === 0)) {
          user.roles = ['user'];
        }

        // If lastName is missing, set it to empty string
        if (hasRequiredFields && !user.lastName) {
          user.lastName = '';
        }

        // If createdAt is missing, set it to current date
        if (hasRequiredFields && !user.createdAt) {
          user.createdAt = new Date().toISOString();
        }

        const isValid = hasRequiredFields && hasValidRoles;
        
        if (!isValid) {
          console.warn('Invalid user object:', user);
        }
        
        return isValid;
      });

      console.log('Valid users:', validUsers);
      setUsers(validUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        setError(`Error: ${error.response?.data?.message || error.message}`);
      } else {
        setError('An unexpected error occurred while fetching users');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthorized = () => {
    Cookies.remove('accessToken');
    router.push('/admin/login');
  };

  const handleApiError = (error: any) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(error.response?.data?.message || 'An error occurred');
    } else {
      setError('An unexpected error occurred');
    }
    setUsers([]);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (!validateToken()) return;

    try {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/${userId}`,
        { roles: [newRole] },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      setUsers(users.map(user => 
        user._id === userId ? { ...user, roles: [newRole] } : user
      ));
      setError(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      handleApiError(error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!validateToken()) return;
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      setUsers(users.filter(user => user._id !== userId));
      setError(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      handleApiError(error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {user.firstName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.roles.includes('admin') ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.roles.includes('admin') ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-3">
                            <select
                              value={user.roles.includes('admin') ? 'admin' : 'user'}
                              onChange={(e) => handleRoleChange(user._id, e.target.value as 'user' | 'admin')}
                              className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;