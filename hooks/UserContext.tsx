// hooks/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  clearUser: () => {},
});

export function UserProvider({ 
  children
}: { 
  children: React.ReactNode,
  serverUser?: any 
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem("user");
        }
      }
    };
    loadUser();
  }, []);
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

 const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);