import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { HiOutlineUser, HiOutlineClock, HiOutlineEye, HiOutlineSearch, HiOutlineTrash, HiOutlineChartBar, HiOutlineCog } from 'react-icons/hi';
import { toast } from 'react-toastify';
import Chart from 'chart.js/auto';

function UserTrackingFromExportPage() {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChart, setActiveChart] = useState('daily');
  const trendChartRef = useRef(null);
  const typeChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const typeChartInstance = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (trendChartRef.current && typeChartRef.current) {
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (typeChartInstance.current) typeChartInstance.current.destroy();

      // Prepare trend data
      const dates = activities.map(a => new Date(a.timestamp).toLocaleDateString());
      const groupedData = dates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const trendLabels = Object.keys(groupedData);
      const trendData = Object.values(groupedData);

      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: {
          labels: trendLabels,
          datasets: [{
            label: 'Activity Count',
            data: trendData,
            borderColor: '#38BDF8',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, title: { display: true, text: 'Count' } } },
          plugins: { legend: { position: 'top' } },
        },
      });

      // Prepare pie chart data
      const activityTypes = [
        { label: 'Page Views', count: activities.filter(a => a.action === 'page_visit').length },
        { label: 'Copy Actions', count: activities.filter(a => a.action === 'copy').length },
        { label: 'Searches', count: activities.filter(a => a.action === 'search').length },
        { label: 'Other', count: activities.filter(a => !['page_visit', 'copy', 'search'].includes(a.action)).length },
      ];
      typeChartInstance.current = new Chart(typeChartRef.current, {
        type: 'pie',
        data: {
          labels: activityTypes.map(t => t.label),
          datasets: [{
            data: activityTypes.map(t => t.count),
            backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171'],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' } },
        },
      });
    }
    return () => {
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (typeChartInstance.current) typeChartInstance.current.destroy();
    };
  }, [activities]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-activity`);
      if (Array.isArray(response.data)) {
        const flattenedActivities = response.data.flatMap(user => [
          ...user.activityLog.map(log => ({
            email: user.email,
            action: log.action,
            page: log.page || user.currentPage,
            details: log.details || {},
            timestamp: log.timestamp?.$date,
            type: 'activityLog',
          })),
          ...user.pageVisits.map(visit => ({
            email: user.email,
            action: 'page_visit',
            page: visit.page,
            details: { page: visit.page },
            timestamp: visit.timestamp?.$date,
            type: 'pageVisits',
          })),
          ...user.copyActions.map(copy => ({
            email: user.email,
            action: 'copy',
            page: copy.page,
            details: { name: copy.name, regCode: copy.regCode },
            timestamp: copy.timestamp?.$date,
            type: 'copyActions',
          })),
          ...user.searches.map(search => ({
            email: user.email,
            action: 'search',
            page: search.page,
            details: { query: search.query, field: search.field },
            timestamp: search.timestamp?.$date,
            type: 'searches',
          })),
        ]);
        setActivities(flattenedActivities);
        const uniqueUsers = [...new Map(response.data.map(user => [user.email, { email: user.email }])).values()];
        setUsers(uniqueUsers);
      }
    } catch (err) {
      toast.error(`Failed to fetch data: ${err.message}`);
      console.error('Fetch error:', err);
      setActivities([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => setFilter(e.target.value);

  const handleSort = (key) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleMetricClick = (metric) => setSelectedMetric(metric === selectedMetric ? null : metric);

  const handleUserClick = (userEmail) => {
    const user = users.find(u => u.email === userEmail);
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleDeleteUser = async (userEmail) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/email/${userEmail}`);
        setUsers(users.filter(u => u.email !== userEmail));
        setActivities(activities.filter(a => a.email !== userEmail));
        toast.success('User deleted successfully');
        setShowUserDetailsModal(false);
      } catch (err) {
        toast.error(`Failed to delete user: ${err.message}`);
      }
    }
  };

  const handleDeleteAllUsers = async () => {
    if (window.confirm('Are you sure you want to delete all users? This action cannot be undone!')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users`);
        setUsers([]);
        setActivities([]);
        toast.success('All users deleted successfully');
      } catch (err) {
        toast.error(`Failed to delete all users: ${err.message}`);
      }
    }
  };

  const handleDeleteUserHistory = async (userEmail) => {
    if (window.confirm('Are you sure you want to delete this user\'s history?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/user-history/${userEmail}`);
        setActivities(activities.filter(a => a.email !== userEmail));
        toast.success('User history deleted successfully');
      } catch (err) {
        toast.error(`Failed to delete user history: ${err.message}`);
      }
    }
  };

  const handleDeleteActivity = async (activityIndex) => {
    const activity = filteredActivities[activityIndex];
    if (window.confirm(`Are you sure you want to delete the activity "${activity.action}" for ${activity.email}?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/activity/${activity.email}/${activity.timestamp}`);
        setActivities(activities.filter((a, i) => i !== activities.findIndex(act => act.email === activity.email && act.timestamp === activity.timestamp)));
        toast.success('Activity deleted successfully');
      } catch (err) {
        toast.error(`Failed to delete activity: ${err.message}`);
      }
    }
  };

  const filteredActivities = activities
    .filter(activity =>
      activity.action?.toLowerCase().includes(filter.toLowerCase()) ||
      activity.email?.toLowerCase().includes(filter.toLowerCase()) ||
      (activity.timestamp && new Date(activity.timestamp).toLocaleString().toLowerCase().includes(filter.toLowerCase())) ||
      (activity.details?.page?.toLowerCase().includes(filter.toLowerCase()) || '')
    )
    .sort((a, b) => {
      if (sortBy === 'timestamp') return sortOrder === 'asc' ? new Date(a.timestamp) - new Date(b.timestamp) : new Date(b.timestamp) - new Date(b.timestamp);
      return sortOrder === 'asc' ? a[sortBy]?.localeCompare(b[sortBy]) : b[sortBy]?.localeCompare(a[sortBy]);
    });

  const userCount = users.length;
  const activityCount = activities.length;

  const getUserDetails = (email) => {
    const userActivities = activities.filter(a => a.email === email);
    const lastSession = response?.data?.find(user => user.email === email)?.sessionData?.slice(-1)[0] || {};
    const latestActivity = userActivities.reduce((latest, current) => {
      return (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) ? current : latest;
    }, null);
    return {
      lastLogin: lastSession.loginTime?.$date ? new Date(lastSession.loginTime.$date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) : (latestActivity?.timestamp ? new Date(latestActivity.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) : 'N/A'),
      device: lastSession.userAgent || userActivities.find(a => a.details?.userAgent)?.details?.userAgent || 'N/A',
      copiedData: userActivities.filter(a => a.action === 'copy').map(a => `${a.details.name} (${a.details.regCode})`) || ['None'],
    };
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen flex flex-col md:flex-row transition-colors duration-300`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 text-white transition-all duration-300 h-screen fixed md:static z-50 md:z-0`}>
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
                  onClick={() => handleMetricClick('dashboard')}
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
                  onClick={() => handleMetricClick('users')}
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
                  onClick={() => handleMetricClick('activities')}
                  className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg ${
                    selectedMetric === 'activities' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } transition-all duration-200`}
                >
                  <HiOutlineClock className="h-5 w-5" />
                  {sidebarOpen && <span className="ml-3">Activities</span>}
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
                  {sidebarOpen && <span className="ml-3">Dark Mode</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
<div className="flex-1 ml-0 md:ml-2 lg:ml-4 transition-all duration-300 overflow-auto">
  {/* Top Navigation */}
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

  {/* Dashboard Content */}
  <main className="p-6 dark:bg-gray-800 min-h-screen">
    {(!selectedMetric || selectedMetric === 'dashboard') && (
      <div className="mb-8 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h2>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => handleMetricClick('users')}
            className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-300 uppercase text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{userCount}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <HiOutlineUser className="h-6 w-6 text-blue-500 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleMetricClick('activities')}
            className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-300 uppercase text-sm font-medium">Total Activities</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{activityCount}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <HiOutlineClock className="h-6 w-6 text-green-500 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-300 uppercase text-sm font-medium">Active Today</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {activities.filter(a => {
                    const today = new Date();
                    const activityDate = new Date(a.timestamp);
                    return activityDate.getDate() === today.getDate() &&
                      activityDate.getMonth() === today.getMonth() &&
                      activityDate.getFullYear() === today.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <HiOutlineEye className="h-6 w-6 text-purple-500 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Activity Trend</h3>
              <div className="flex space-x-2">
                {['daily', 'weekly', 'monthly'].map(period => (
                  <button
                    key={period}
                    onClick={() => setActiveChart(period)}
                    className={`px-3 py-1 text-sm rounded-md ${activeChart === period ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'} transition-all duration-200`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <canvas ref={trendChartRef}></canvas>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Activity Distribution</h3>
            <div className="h-64">
              <canvas ref={typeChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activities</h3>
            <button
              onClick={() => handleMetricClick('activities')}
              className="text-blue-500 dark:text-blue-400 text-sm font-medium hover:underline transition-colors duration-200"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start border-b border-gray-200 dark:border-gray-600 pb-4 last:border-0 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                  <HiOutlineClock className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 dark:text-white">{activity.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 capitalize">
                    {activity.action?.replace('_', ' ')} - {activity.details?.page || activity.page || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {selectedMetric === 'users' && (
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
          <button
            onClick={handleDeleteAllUsers}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 flex items-center"
          >
            <HiOutlineTrash className="mr-2" />
            Delete All Users
          </button>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={filter}
            onChange={handleFilterChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          />
          <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center">
                    <div className="animate-pulse flex justify-center">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => {
                  const userActivities = activities.filter(a => a.email === user.email);
                  const lastActivity = userActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                  
                  return (
                    <tr key={user.email} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {lastActivity?.timestamp ? new Date(lastActivity.timestamp).toLocaleString() : 'No activity'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400 capitalize">
                          {lastActivity?.action ? lastActivity.action.replace('_', ' ') : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleUserClick(user.email)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors duration-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mr-2 transition-colors duration-200"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUserHistory(user.email)}
                          className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors duration-200"
                        >
                          Delete History
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {selectedMetric === 'activities' && (
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Activity Logs</h2>
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Filter by action, email, page, or date..."
              value={filter}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    Email
                    {sortBy === 'email' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('action')}
                  className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    Action
                    {sortBy === 'action' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('page')}
                  className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    Page
                    {sortBy === 'page' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    Timestamp
                    {sortBy === 'timestamp' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="animate-pulse space-y-2">
                      {Array(5).fill().map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300 capitalize">
                        {activity.action?.replace('_', ' ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {activity.details?.page || activity.page || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteActivity(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        <HiOutlineTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No activities found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Loading Indicator */}
    {loading && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-700 dark:text-white">Loading data...</p>
        </div>
      </div>
    )}
</main>
</div>



      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">User Details</h3>
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                      {selectedUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 dark:text-white">{selectedUser.email}</h4>
                      <p className="text-gray-500 dark:text-gray-400">Last activity: {getUserDetails(selectedUser.email).lastLogin}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Device Info</h5>
                    <p className="text-gray-800 dark:text-white">{getUserDetails(selectedUser.email).device}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Copied Data</h5>
                    <div className="text-gray-800 dark:text-white">
                      {getUserDetails(selectedUser.email).copiedData.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {getUserDetails(selectedUser.email).copiedData.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>None</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recent Activities</h5>
                  <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {activities.filter(a => a.email === selectedUser.email).slice(0, 10).map((activity, i) => (
                      <div key={i} className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-500 last:border-0 transition-all duration-200">
                        <p className="text-sm text-gray-800 dark:text-white capitalize">
                          {activity.action?.replace('_', ' ')} - {activity.details?.page || activity.page || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowUserDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.email)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 flex items-center"
                  >
                    <HiOutlineTrash className="mr-2" />
                    Delete User
                  </button>
                  <button
                    onClick={() => handleDeleteUserHistory(selectedUser.email)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-200 flex items-center"
                  >
                    <HiOutlineTrash className="mr-2" />
                    Delete History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline CSS for Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default UserTrackingFromExportPage;