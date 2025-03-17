// // src/context/AuthContext.js
// import React, { createContext, useState, useContext, useEffect } from "react";
// import axiosInstance from "../utils/axiosInstance";

// // Create the auth context
// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Get current user on initial load
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         // Skip the fetch on auth pages
//         const publicPaths = ["/login", "/register", "/available-vehicles","/pending-verification"];
//         if (publicPaths.includes(window.location.pathname)) {
//           setLoading(false);
//           return;
//         }

//         setLoading(true);
//         const response = await axiosInstance.get("/auth/profile");

//         if (response.data && response.data.user) {
//           setUser(response.data.user);
//         }
//       } catch (err) {
//         console.error("Failed to fetch user profile:", err);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCurrentUser();
//   }, []); // Make sure the dependency array is present

//   // Login function
//   const login = async (email, password) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await axiosInstance.post("/auth/login", {
//         email,
//         password,
//       });

//       if (response.data && response.data.user) {
//         setUser(response.data.user);
//         return { success: true, user: response.data.user };
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//       return {
//         success: false,
//         error: err.response?.data?.message || "Login failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Register function
//   const register = async (userData) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await axiosInstance.post("/auth/register", userData);

//       return { success: true, message: response.data.message };
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//       return {
//         success: false,
//         error: err.response?.data?.message || "Registration failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Logout function
//   const logout = async () => {
//     try {
//       setLoading(true);

//       await axiosInstance.post("/auth/logout");

//       setUser(null);
//       return { success: true };
//     } catch (err) {
//       console.error("Logout error:", err);
//       return {
//         success: false,
//         error: err.response?.data?.message || "Logout failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to verify if the user is an admin
//   const isAdmin = () => {
//     return user && user.role === "ADMIN";
//   };

//   // Function to verify if the user is verified
//   const isVerified = () => {
//     return user && user.status === "VERIFIED";
//   };

//   // Context value to be provided
//   const value = {
//     user,
//     loading,
//     error,
//     login,
//     register,
//     logout,
//     isAdmin,
//     isVerified,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // Custom hook to use the auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };




// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [count ,setCount] = useState(0)


  console.log("axiosinterceptor,", user);

  // Get current user on initial load
  // At the top of your component, add this ref:

// Then the function:
const fetchCurrentUser = async () => {
  const publicPaths = ["/","/login", "/register", "/available-vehicles", "/pending-verification"];
  
  // Skip if we've already tried to fetch
  if (initialized) {
    console.log("Already initialized, skipping fetch");
    setLoading(false);
    return;
  }
  
  // On public paths, we do a quick check first
  if (publicPaths.includes(window.location.pathname)) {
    try {
      // Quick check if cookies exist by making a HEAD request
      const checkResponse = await axiosInstance.head("/auth/profile", {
        timeout: 1500,
        validateStatus: (status) => status < 500 // Accept 2xx, 3xx, 4xx responses
      });
      
      // If we get 401/403, user is definitely not logged in
      if (checkResponse.status === 401 || checkResponse.status === 403) {
        console.log("User not authenticated on public path, skipping full fetch");
        setLoading(false);
        setInitialized(true);
        return;
      }
      
      // Otherwise continue with full fetch
    } catch (err) {
      // Network error or timeout, assume not logged in on public paths
      if (publicPaths.includes(window.location.pathname)) {
        console.log("Auth check failed on public path, skipping fetch");
        setLoading(false);
        setInitialized(true);
        return;
      }
    }
  }

  // Standard fetch flow
  try {
    console.log("Fetching user profile");
    setLoading(true);
    const response = await axiosInstance.get("/auth/profile");
    
    if (response.data && response.data.user) {
      setUser(response.data.user);
    } else {
      setUser(null);
    }
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    setUser(null);
  } finally {
    setLoading(false);
    setInitialized(true);
  }
};

  // Initial loading of user profile
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Setup an interceptor to handle authentication errors
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Token expired or invalid, logout user
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptor when component unmounts
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // The cookie will be set automatically by the browser from the response
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      }, { withCredentials: true }); // Important for cookies

      if (response.data && response.data.user) {
        setUser(response.data.user);
        setInitialized(true); // Mark as initialized after successful login
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post("/auth/register", userData, 
        { withCredentials: true }); // Important for cookies

      return { success: true, message: response.data.message };
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      return {
        success: false,
        error: err.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      // This will clear the cookie on the server
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });

      // Clear user state
      setUser(null);
      
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err);
      
      // Still clear user state even if API call fails
      setUser(null);
      
      return {
        success: false,
        error: err.response?.data?.message || "Logout failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Function to verify if the user is an admin
  const isAdmin = () => {
    return user && user.role === "ADMIN";
  };

  // Function to verify if the user is verified
  const isVerified = () => {
    return user && user.status === "VERIFIED";
  };

  // Function to manually refresh user data (useful after profile updates)
  const refreshUser = async () => {
    // Don't fetch for public paths
    const publicPaths = ["/","/login", "/register", "/available-vehicles", "/pending-verification"];
    if (publicPaths.includes(window.location.pathname)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/profile");

      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Context value to be provided
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isVerified,
    refreshUser,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};



// // src/context/AuthContext.js
// import React, { createContext, useState, useContext, useEffect } from "react";
// import axiosInstance from "../utils/axiosInstance";

// // Create the auth context
// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [initialized, setInitialized] = useState(false);
//   const [publicPathChecked, setPublicPathChecked] = useState(false);
//   const [currentPath, setCurrentPath] = useState(window.location.pathname);

//   console.log("Current path:", currentPath);
//   console.log("User state:", user);
//   console.log("Initialized:", initialized);
//   console.log("Public path checked:", publicPathChecked);

//   // Define public paths that don't require authentication
//   const publicPaths = ["/login", "/register", "/available-vehicles", "/pending-verification"];
  
//   // Check if current path is public
//   const isPublicPath = (path) => {
//     return publicPaths.some(publicPath => path.startsWith(publicPath));
//   };

//   // Update current path when location changes
//   useEffect(() => {
//     const updatePath = () => {
//       const newPath = window.location.pathname;
//       if (newPath !== currentPath) {
//         console.log("Path changed from", currentPath, "to", newPath);
//         setCurrentPath(newPath);
        
//         // If moving from public path to non-public, reset the checks
//         if (isPublicPath(currentPath) && !isPublicPath(newPath)) {
//           console.log("Moving from public to private path, resetting checks");
//           setInitialized(false);
//           setPublicPathChecked(false);
//         }
//       }
//     };

//     // Check on navigation events
//     window.addEventListener('popstate', updatePath);
    
//     // Also check periodically for SPA navigation that doesn't trigger popstate
//     const interval = setInterval(updatePath, 500);
    
//     return () => {
//       window.removeEventListener('popstate', updatePath);
//       clearInterval(interval);
//     };
//   }, [currentPath]);

//   // Get current user profile
//   const fetchCurrentUser = async () => {
//     const path = window.location.pathname;
//     console.log("Fetching user for path:", path);
    
//     // Handle public paths - we still want to check but won't require login
//     if (isPublicPath(path)) {
//       console.log("On public path");
      
//       // If we already checked for this public path, don't check again
//       if (publicPathChecked) {
//         console.log("Already checked public path, skipping");
//         setLoading(false);
//         return;
//       }
      
//       setPublicPathChecked(true);
//     }
    
//     // Skip if we've already initialized (unless we're changing path types)
//     if (initialized && !isPublicPath(path)) {
//       console.log("Already initialized on private path, skipping");
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log("Making API call to fetch profile");
//       setLoading(true);
//       const response = await axiosInstance.get("/auth/profile");
//       console.log("Profile response:", response.data);

//       if (response.data && response.data.user) {
//         console.log("Setting user from response");
//         setUser(response.data.user);
//       } else {
//         console.log("No user in response, setting null");
//         setUser(null);
//       }
//     } catch (err) {
//       console.error("Failed to fetch user profile:", err);
//       setUser(null);
//     } finally {
//       setLoading(false);
//       setInitialized(true);
//     }
//   };

//   // Initial loading of user profile and when path changes
//   useEffect(() => {
//     fetchCurrentUser();
//   }, [currentPath]);

//   // Setup an interceptor to handle authentication errors
//   useEffect(() => {
//     const interceptor = axiosInstance.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//           // Token expired or invalid, logout user
//           console.log("Auth error intercepted, clearing user");
//           setUser(null);
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       // Clean up interceptor when component unmounts
//       axiosInstance.interceptors.response.eject(interceptor);
//     };
//   }, []);

//   // Login function
//   const login = async (email, password) => {
//     try {
//       setLoading(true);
//       setError(null);

//       // The cookie will be set automatically by the browser from the response
//       const response = await axiosInstance.post("/auth/login", {
//         email,
//         password,
//       }, { withCredentials: true }); // Important for cookies

//       if (response.data && response.data.user) {
//         console.log("Login successful, setting user");
//         setUser(response.data.user);
//         setInitialized(true);
//         setPublicPathChecked(true);
//         return { success: true, user: response.data.user };
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//       return {
//         success: false,
//         error: err.response?.data?.message || "Login failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Register function
//   const register = async (userData) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await axiosInstance.post("/auth/register", userData, 
//         { withCredentials: true }); // Important for cookies

//       return { success: true, message: response.data.message };
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//       return {
//         success: false,
//         error: err.response?.data?.message || "Registration failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Logout function
//   const logout = async () => {
//     try {
//       setLoading(true);

//       // This will clear the cookie on the server
//       await axiosInstance.post("/auth/logout", {}, { withCredentials: true });

//       // Clear user state
//       console.log("Logout successful, clearing user");
//       setUser(null);
      
//       return { success: true };
//     } catch (err) {
//       console.error("Logout error:", err);
      
//       // Still clear user state even if API call fails
//       setUser(null);
      
//       return {
//         success: false,
//         error: err.response?.data?.message || "Logout failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to verify if the user is an admin
//   const isAdmin = () => {
//     return user && user.role === "ADMIN";
//   };

//   // Function to verify if the user is verified
//   const isVerified = () => {
//     return user && user.status === "VERIFIED";
//   };

//   // Function to manually refresh user data (useful after profile updates)
//   const refreshUser = async () => {
//     console.log("Manual refresh requested");
//     // Reset checks to force a refresh
//     setInitialized(false);
//     setPublicPathChecked(false);
//     return fetchCurrentUser();
//   };

//   // Function to check if user is authenticated
//   const isAuthenticated = () => {
//     return !!user;
//   };

//   // Context value to be provided
//   const value = {
//     user,
//     loading,
//     error,
//     login,
//     register,
//     logout,
//     isAdmin,
//     isVerified,
//     refreshUser,
//     isAuthenticated
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // Custom hook to use the auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };