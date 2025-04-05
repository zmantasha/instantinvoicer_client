"use client"
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Define the User type (you can extend this with other properties if necessary)
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  address:string;
  logo:string;
  avatar:string;
  roles: string[];
  is_verified: boolean;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUserProfile: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider = ({ children }:{children: React.ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user profile
  const fetchUserProfile = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      console.log("Access Token:", accessToken ? "Present" : "Missing");
      
      if (!accessToken) {
        console.log("No access token found, setting user to null");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("Fetching user profile...");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
      console.log("User profile response:", response.data);
      
      // Extract the user data from the nested structure
      const userData = response.data.user;
      console.log("Extracted user data:", userData);
      
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  useEffect(() => {
    console.log("UserProvider mounted, fetching profile");
    fetchUserProfile();
  }, []);

  // Check if user has admin role in the roles array
  const isAdmin = Boolean(user?.roles?.includes('admin'));
  console.log("Current user state:", { user, isAdmin, loading, roles: user?.roles });
  return (
    <UserContext.Provider value={{ user, setUser, fetchUserProfile, isAdmin, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
