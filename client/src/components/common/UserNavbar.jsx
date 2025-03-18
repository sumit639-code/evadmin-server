import React, { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { FiMenu, FiX } from "react-icons/fi";
import { IoCarOutline } from "react-icons/io5";
import { FaRegCalendarCheck } from "react-icons/fa";
import { MdOutlineAccountCircle, MdOutlineChat } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  console.log("user is here", user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const isLoggedIn = !!user; // Check if user is logged in

  // Handle click outside to close dropdown and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        navigate("/login");
      } else {
        console.error("Logout failed:", result.error);
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  // Handle chat navigation
  const handleChatNavigation = () => {
    if (isLoggedIn) {
      navigate("/chat");
    } else {
      navigate("/login", { state: { from: "/chat" } });
    }
  };

  // Check if route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      {/* Desktop Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-green-600">
            ECORYDS
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/vehicles"
              className={`flex items-center ${
                isActive("/vehicles")
                  ? "text-green-600 font-medium"
                  : "text-gray-700 hover:text-indigo-600"
              } transition-colors duration-200`}
            >
              <IoCarOutline className="mr-1" />
              Available Vehicles
            </Link>
            {isLoggedIn && (
              <Link
                to="/myBookings"
                className={`flex items-center ${
                  isActive("/myBookings")
                    ? "text-green-600 font-medium"
                    : "text-gray-700 hover:text-indigo-600"
                } transition-colors duration-200`}
              >
                <FaRegCalendarCheck className="mr-1" />
                My Bookings
              </Link>
            )}
          </div>

          {/* Desktop Right Section - Search, Chat, and Profile/Login */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                className="border border-gray-300 rounded-full pl-9 pr-4 py-1.5 w-48 focus:w-64 focus:border-indigo-500 focus:outline-none transition-all duration-300"
                placeholder="Search"
              />
            </div>

            {/* Chat Icon */}
            <button
              onClick={handleChatNavigation}
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              title="Chat with Support"
            >
              <MdOutlineChat className="h-6 w-6 text-green-600" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-600"></span>
            </button>

            {isLoggedIn ? (
              /* Profile Dropdown - Only shown when logged in */
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    src={user?.avatar || "admin.jpg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || "Role"}
                    </p>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.role || "Role"}
                      </p>
                    </div>
                    {/* <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                      Settings
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button - Only shown when not logged in */
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="menu-button p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        {/* Mobile Search */}
        <div className="px-4 pt-2 pb-3 space-y-1 border-b border-gray-200">
          <div className="relative mt-1">
            <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search"
            />
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/vehicles"
            className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
              isActive("/vehicles")
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <IoCarOutline className="mr-2 h-5 w-5" />
            Available Vehicles
          </Link>

          {isLoggedIn && (
            <Link
              to="/myBookings"
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActive("/myBookings")
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaRegCalendarCheck className="mr-2 h-5 w-5" />
              My Bookings
            </Link>
          )}

          {/* Chat Link for Mobile */}
          <button
            onClick={() => {
              handleChatNavigation();
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center px-3 py-2 rounded-md text-base font-medium ${
              isActive("/chat")
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <MdOutlineChat className="mr-2 h-5 w-5" />
            Chat with Support
          </button>

          {/* Mobile Profile Links or Login Button */}
          {isLoggedIn ? (
            <div className="border-t border-gray-200 pt-2">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MdOutlineAccountCircle className="mr-2 h-5 w-5" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-2">
              <Link
                to="/login"
                className="flex items-center justify-center px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  ></path>
                </svg>
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;

// import React, { useState, useRef, useEffect } from 'react';
// import { CiSearch } from 'react-icons/ci';
// import { FiMenu, FiX } from 'react-icons/fi';
// import { IoCarOutline } from 'react-icons/io5';
// import { FaRegCalendarCheck } from 'react-icons/fa';
// import { MdOutlineAccountCircle } from 'react-icons/md';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../Context/AuthContext';

// const UserNavbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, logout } = useAuth();
//   console.log("user is here",user);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const mobileMenuRef = useRef(null);
//   const isLoggedIn = !!user; // Check if user is logged in

//   // Handle click outside to close dropdown and mobile menu
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//       if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
//           !event.target.closest('.menu-button')) {
//         setMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       const result = await logout();
//       if (result.success) {
//         navigate('/login');
//       } else {
//         console.error('Logout failed:', result.error);
//         navigate('/login');
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//       navigate('/login');
//     }
//   };

//   // Check if route is active
//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   return (
//     <nav className="bg-white shadow-md">
//       {/* Desktop Navbar */}
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0 flex items-center">
//             <Link to="/" className="text-xl font-bold text-green-600">
//               ScooterRent
//             </Link>
//           </div>

//           {/* Desktop Navigation Links */}
//           <div className="hidden md:flex items-center space-x-8">
//             <Link
//               to="/vehicles"
//               className={`flex items-center ${isActive('/vehicles') ? 'text-green-600 font-medium' : 'text-gray-700 hover:text-indigo-600'} transition-colors duration-200`}
//             >
//               <IoCarOutline className="mr-1" />
//               Available Vehicles
//             </Link>
//             {isLoggedIn && (
//               <Link
//                 to="/mybookings"
//                 className={`flex items-center ${isActive('/mybookings') ? 'text-green-600 font-medium' : 'text-gray-700 hover:text-indigo-600'} transition-colors duration-200`}
//               >
//                 <FaRegCalendarCheck className="mr-1" />
//                 My Bookings
//               </Link>
//             )}
//           </div>

//           {/* Desktop Right Section - Search and Profile/Login */}
//           <div className="hidden md:flex items-center space-x-4">
//             {/* Search Bar */}
//             <div className="relative">
//               <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
//               <input
//                 type="text"
//                 className="border border-gray-300 rounded-full pl-9 pr-4 py-1.5 w-48 focus:w-64 focus:border-indigo-500 focus:outline-none transition-all duration-300"
//                 placeholder="Search"
//               />
//             </div>

//             {isLoggedIn ? (
//               /* Profile Dropdown - Only shown when logged in */
//               <div className="relative" ref={dropdownRef}>
//                 <div
//                   className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
//                   onClick={() => setShowDropdown(!showDropdown)}
//                 >
//                   <img
//                     src={user?.avatar || "admin.jpg"}
//                     alt="Profile"
//                     className="w-8 h-8 rounded-full border border-gray-200"
//                   />
//                   <div className="hidden lg:block">
//                     <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
//                     <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
//                   </div>
//                 </div>

//                 {/* Dropdown Menu */}
//                 {showDropdown && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100">
//                     <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
//                       <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
//                       <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
//                     </div>
//                     <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">
//                       Profile
//                     </Link>
//                     <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600">
//                       Settings
//                     </Link>
//                     <button
//                       onClick={handleLogout}
//                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
//                     >green-600
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               /* Login Button - Only shown when not logged in */
//               <Link
//                 to="/login"
//                 className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-colors duration-200"
//               >
//                 Login
//               </Link>
//             )}
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               className="menu-button p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             >
//               {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <div
//         ref={mobileMenuRef}
//         className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
//       >
//         {/* Mobile Search */}
//         <div className="px-4 pt-2 pb-3 space-y-1 border-b border-gray-200">
//           <div className="relative mt-1">
//             <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
//             <input
//               type="text"
//               className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               placeholder="Search"
//             />
//           </div>
//         </div>

//         {/* Mobile Nav Links */}
//         <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//           <Link
//             to="/vehicles"
//             className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
//               isActive('/vehicles')
//                 ? 'bg-indigo-50 text-indigo-600'
//                 : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
//             }`}
//             onClick={() => setMobileMenuOpen(false)}
//           >
//             <IoCarOutline className="mr-2 h-5 w-5" />
//             Available Vehicles
//           </Link>

//           {isLoggedIn && (
//             <Link
//               to="/mybookings"
//               className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
//                 isActive('/mybookings')
//                   ? 'bg-indigo-50 text-indigo-600'
//                   : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
//               }`}
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               <FaRegCalendarCheck className="mr-2 h-5 w-5" />
//               My Bookings
//             </Link>
//           )}

//           {/* Mobile Profile Links or Login Button */}
//           {isLoggedIn ? (
//             <div className="border-t border-gray-200 pt-2">
//               <Link
//                 to="/profile"
//                 className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 <MdOutlineAccountCircle className="mr-2 h-5 w-5" />
//                 Profile
//               </Link>
//               <Link
//                 to="/settings"
//                 className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
//                 </svg>
//                 Settings
//               </Link>
//               <button
//                 onClick={() => {
//                   handleLogout();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
//               >
//                 <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
//                 </svg>
//                 Logouts
//               </button>
//             </div>
//           ) : (
//             <div className="border-t border-gray-200 pt-2">
//               <Link
//                 to="/login"
//                 className="flex items-center justify-center px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
//                 </svg>
//                 Login
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default UserNavbar;
