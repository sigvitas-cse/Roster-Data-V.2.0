import React from 'react';
import { HiOutlineChartBar, HiOutlineUser, HiOutlineClock, HiOutlineCog, HiOutlineDocumentText } from 'react-icons/hi';

const Sidebar = ({ sidebarOpen, setSidebarOpen, selectedMetric, handleMetricClick, darkMode, setDarkMode, onNavigate }) => {
  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 text-white transition-all duration-300 h-screen fixed md:sticky top-0 z-40`}>
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen ? (
          <h2 className="text-xl font-bold">UserTrack</h2>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">UT</div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors duration-200">
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className="mt-6">
        <div className="mb-6">
          {sidebarOpen && <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-2 px-4">Dashboard</h3>}
          <ul>
            <li>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleMetricClick('dashboard');
                  onNavigate('/dashboard'); // Log page visit for dashboard
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg ${
                  !selectedMetric || selectedMetric === 'dashboard' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } transition-all duration-200`}
              >
                <HiOutlineChartBar className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Analytics</span>}
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleMetricClick('users');
                  onNavigate('/users'); // Log page visit for users
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg ${
                  selectedMetric === 'users' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } transition-all duration-200`}
              >
                <HiOutlineUser className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Users</span>}
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleMetricClick('activities');
                  onNavigate('/activities'); // Log page visit for activities
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg ${
                  selectedMetric === 'activities' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } transition-all duration-200`}
              >
                <HiOutlineClock className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Activities</span>}
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleMetricClick('details');
                  onNavigate('/details'); // Log page visit for details
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg ${
                  selectedMetric === 'details' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } transition-all duration-200`}
              >
                <HiOutlineDocumentText className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Show Activity Details</span>}
              </button>
            </li>
          </ul>
        </div>
        
        <div>
          {sidebarOpen && <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-2 px-4">Settings</h3>}
          <ul>
            <li>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200`}
              >
                <HiOutlineCog className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;