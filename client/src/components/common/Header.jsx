import React from 'react';
import SearchBar from './SearchBar';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <SearchBar />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
