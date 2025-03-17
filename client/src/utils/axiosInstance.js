import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // Important for cookies - ensures cookies are sent with every request
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // No need to manually add the token as it will be sent in the cookie automatically
    // when withCredentials is true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with error status
      const { status } = error.response;
      const { message } = error.response.data || {};
      
      if (status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login';
      }
      
      if (status === 403) {
        // Don't redirect for chat permission issues
        if (message && (
            message.includes('Please wait for an admin to approve this conversation') ||
            message.includes('This conversation has been blocked') ||
            message.includes('Access denied')
        )) {
          // Just log the error, don't redirect
          console.log('Chat permission error:', message);
          // Let the component handle this error
          return Promise.reject(error);
        }
        
        // If it's a verification issue (user is pending)
        if (message && message.includes('pending verification')) {
          window.location.href = '/chat';
        }
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
// // src/utils/axiosInterceptor.js
// import axios from 'axios';

// // Create axios instance with base URL
// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:3000/api',
//   withCredentials: true // Important for cookies - ensures cookies are sent with every request
// });

// // Request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // No need to manually add the token as it will be sent in the cookie automatically
//     // when withCredentials is true
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle common errors here
//     if (error.response) {
//       // Server responded with error status
//       const { status } = error.response;
      
//       if (status === 401) {
//         // Unauthorized - redirect to login
//         // We shouldn't need to clear localStorage since we're not using it for auth
//         // But we can redirect to login page
//         window.location.href = '/login';
//       }
      
//       if (status === 403) {
//         // Forbidden - access denied
//         console.error('Access denied:', error.response.data.message);
        
//         // If it's a verification issue (user is pending)
//         if (error.response.data.message?.includes('pending verification')) {
//           window.location.href = '/pending-verification';
//         }
//       }
//     } else if (error.request) {
//       // Request made but no response received
//       console.error('Network error. Please check your connection.');
//     } else {
//       // Something else happened
//       console.error('Error:', error.message);
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;