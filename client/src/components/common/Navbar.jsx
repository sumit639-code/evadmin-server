import React, { useState, useRef, useEffect } from 'react';
import { CiSearch } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout function from auth context
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout with proper auth context
  const handleLogout = async () => {
   
    try {
   
      const result = await logout();

      
      if (result.success) {

        navigate('/login');
      } else {
        console.error('Logout failed:', result.error);
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <div className='flex container mx-auto justify-between items-center p-3 border-b bg-white'>
      {/* Search Bar */}
      <div className="relative flex items-center flex-1 max-w-[338px]">
        <CiSearch className="absolute left-2 text-gray-500" />
        <input
          type="text"
          className="border border-[#8C8C8C] rounded pl-8 w-full h-[38px] focus:border-[#8C8C8C] focus:outline-none"
          placeholder="Search"
        />
      </div>

      {/* Profile Section */}
      <div className='relative' ref={dropdownRef}>
        <div 
          className='flex items-center ml-4 cursor-pointer' 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <img 
            src="admin.jpg" 
            alt="Admin" 
            className='w-[40px] h-[40px] rounded-full mr-2' 
          />
          <div>
            <h4 className='text-[14px] font-medium'>{user?.name || 'User'}</h4>
            <h4 className='text-[12px]'>{user?.role || 'Role'}</h4>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            {/* <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Profile
            </a>
            <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Settings
            </a> */}
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;