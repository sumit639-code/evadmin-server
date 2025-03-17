import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiBell,
  FiMoon,
  FiSun
} from 'react-icons/fi';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: 'Admin User',
    email: 'admin@ecoryds.com',
    avatar: null, // Add avatar URL if available
    notifications: [
      {
        id: 1,
        message: 'New rider registration',
        time: '5 minutes ago',
        unread: true
      },
      {
        id: 2,
        message: 'New rental request',
        time: '1 hour ago',
        unread: true
      },
      {
        id: 3,
        message: 'Payment processed',
        time: '2 hours ago',
        unread: false
      }
    ]
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Implement dark mode logic here
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
  };

  const unreadNotifications = user.notifications.filter(n => n.unread).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setIsOpen(false);
          }}
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <FiBell className="text-xl" />
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Profile Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowNotifications(false);
          }}
          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium">{user.name}</span>
        </button>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border py-2 z-50">
          <div className="px-4 py-2 border-b">
            <h3 className="font-medium">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {user.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 ${
                  notification.unread ? 'bg-blue-50' : ''
                }`}
              >
                <p className="text-sm">{notification.message}</p>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t">
            <Link
              to="/notifications"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border py-2 z-50">
          <div className="px-4 py-2 border-b">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          
          <div className="py-2">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FiUser className="text-gray-400" />
              <span>Profile</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FiSettings className="text-gray-400" />
              <span>Settings</span>
            </Link>
            <Link
              to="/help"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FiHelpCircle className="text-gray-400" />
              <span>Help & Support</span>
            </Link>
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              {isDarkMode ? (
                <FiSun className="text-gray-400" />
              ) : (
                <FiMoon className="text-gray-400" />
              )}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div className="border-t py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-gray-50"
            >
              <FiLogOut className="text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
