import React from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

const Header = ({ sidebarOpen, setSidebarOpen, filter, handleFilterChange }) => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-4 md:hidden text-gray-700 dark:text-gray-300 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">User Tracking Dashboard</h1>
      </div>
      
      <div className="flex items-center">
        <div className="relative mr-4">
          <input
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={handleFilterChange}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          />
          <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        
        <div className="relative">
          <button className="flex items-center focus:outline-none">
            <span className="text-gray-700 dark:text-gray-300 mr-3">Admin</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">A</div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;