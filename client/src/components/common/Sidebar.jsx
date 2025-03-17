import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  RiDashboardLine,
  RiMotorbikeLine,
  RiUserLine,
  RiUserSettingsLine,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiShieldUserLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiCarLine,
  RiChatHistoryLine,
  RiAccountCircleLine ,
  RiFileSettingsLine,
  RiChat1Line
} from 'react-icons/ri';


import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
   const { logout } = useAuth();

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

  const menuItems = [
    { path: '/admin', icon: RiDashboardLine, label: 'Admin Overview' },
    { path: '/scooter', icon: RiMotorbikeLine, label: 'Scooter Management' },
    // { path: '/rider', icon: RiUserLine, label: 'Ryder Details' },
    { path: '/users', icon: RiUserSettingsLine, label: 'User Management' },
    { path: '/pending', icon: RiUserSettingsLine, label: 'Pending user ' },
    { path: '/rental', icon: RiCarLine, label: 'Rental Vehicle' },
    { path: '/transaction', icon: RiMoneyDollarCircleLine, label: 'Transactions' },
    { path: '/revenue', icon: RiMoneyDollarCircleLine, label: 'Revenue' },
    { path: '/booking', icon: RiChatHistoryLine, label: 'Booking History' },
    { path: '/adminRegister', icon: RiAccountCircleLine , label: 'Register Admin' },
 

    // { path: '/incentive', icon: RiPercentLine, label: 'Incentive and Bonus' },
    // { path: '/insurance', icon: RiShieldUserLine, label: 'Insurance Management' },
  ];

  return (
    <div className={`w-64 min-h-screen bg-white border-r ${location.pathname === '/' ? 'hidden' : 'block'}`}>
      {/* Logo */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-green-600">ECORYDS</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">This is a placeholder logo</div>
      </div>

      {/* Pages Label */}
      <div className="px-4 py-2">
        <span className="text-xs font-medium text-gray-500">PAGES</span>
      </div>

      {/* Navigation Items */}
      <nav className="px-2 flex flex-col h-[calc(100vh-200px)] justify-between">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
              >
                <item.icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Section with Settings and Logout */}
        <div className="space-y-1 mt-auto">
          <Link
            to="/chats"
            className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-200 group
              ${location.pathname === '/chats'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`}
          >
            <RiChat1Line  className={`text-xl ${location.pathname === '/chats' ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}`} />
            <span className="font-medium">Chat</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-200 group
              ${location.pathname === '/settings'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`}
          >
            <RiSettings4Line className={`text-xl ${location.pathname === '/settings' ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}`} />
            <span className="font-medium">Settings</span>
          </Link>

          <button className="flex items-center gap-3 px-4 py-3 my-1 rounded-lg w-full text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 group" onClick={handleLogout}>
            <RiLogoutBoxRLine className="text-xl text-gray-500 group-hover:text-green-600" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;