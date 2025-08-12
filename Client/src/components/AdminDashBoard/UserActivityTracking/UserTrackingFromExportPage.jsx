import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Chart from 'chart.js/auto';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import DashboardOverview from './Components/DashboardOverview';
import UserManagement from './Components/UserManagement';
import ActivityLogs from './Components/ActivityLogs';
import UserDetailsModal from './Components/UserDetailsModal';
import LoadingIndicator from './Components/LoadingIndicator';
import UserActivityDetails from './Components/UserActivityDetails';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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

const logPageVisit = useCallback(
  debounce(async (page, currentPage) => {
    console.log(`Executing page visit log for ${page} at ${new Date().toISOString()}`);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/log-page-visit`,
        { page, currentPage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log(`Page visit logged for ${page}:`, response.data);
      // Refresh data if needed
    } catch (err) {
      console.error('Page visit log error:', err.response ? err.response.data : err.message);
      // toast.error(`Failed to log page visit: ${err.message}`);
    }
  }, 1000), // 1-second debounce
  []
);

const handleNavigation = (page) => {
  console.log(`Attempting to navigate to ${page} at ${new Date().toISOString()}`);
  const currentPage = 1; // Adjust based on your logic
  logPageVisit(page, currentPage);
};

  useEffect(() => {
    fetchData();
  }, []);

 const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-activity`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('API Response:', response.data);
      if (Array.isArray(response.data)) {
        const flattenedActivities = response.data.flatMap(user => [
          ...user.activityLog.map(log => ({
            email: user.email,
            action: log.action,
            page: log.page || user.currentPage,
            details: log.details || {},
            timestamp: log.timestamp || null,
            type: 'activityLog',
          })),
          ...user.pageVisits.map(visit => ({
            email: user.email,
            action: 'page_visit',
            page: visit.page,
            details: { page: visit.page },
            timestamp: visit.timestamp || null,
            type: 'pageVisits',
          })),
          ...user.copyActions.map(copy => ({
            email: user.email,
            action: 'copy',
            page: copy.page,
            details: { name: copy.name, regCode: copy.regCode },
            timestamp: copy.timestamp || null,
            type: 'copyActions',
          })),
          ...user.searches.map(search => ({
            email: user.email,
            action: 'search',
            page: search.page,
            details: { query: search.query, field: search.field },
            timestamp: search.timestamp || null,
            type: 'searches',
          })),
        ]).filter(activity => activity.timestamp);
        console.log('Flattened Activities:', flattenedActivities);
        setActivities(flattenedActivities);
        const uniqueUsers = [...new Map(response.data.map(user => [user.email, { email: user.email }])).values()];
        setUsers(uniqueUsers);
      } else {
        console.warn('Response data is not an array:', response.data);
        setActivities([]);
        setUsers([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error(`Failed to fetch data: ${err.message}`);
      setActivities([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trendChartRef.current && typeChartRef.current) {
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (typeChartInstance.current) typeChartInstance.current.destroy();

      const dates = activities
        .filter(a => a.timestamp)
        .map(a => new Date(a.timestamp).toLocaleDateString());
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
            borderColor: darkMode ? '#38BDF8' : '#1E40AF',
            backgroundColor: darkMode ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 64, 175, 0.2)',
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
            backgroundColor: darkMode
              ? ['#60A5FA', '#34D399', '#FBBF24', '#F87171']
              : ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
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
  }, [activities, darkMode]);

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
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(userEmail)}`);
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
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(userEmail)}/history`);
        // Update activities to remove history-related entries for the user
        setActivities(activities.filter(a => a.email !== userEmail || !['activityLog', 'pageVisits', 'copyActions', 'searches'].includes(a.type)));
        toast.success('User history deleted successfully');
      } catch (err) {
        toast.error(`Failed to delete user history: ${err.message}`);
      }
    }
  };

  const handleDeleteActivity = (email, timestamp) => {
    setActivities(activities.filter(a => a.email !== email || a.timestamp !== timestamp));
  };

  // Example navigation handler to trigger page visit logging
  // const handleNavigation = (page) => {
  //   const currentPage = 1; // Adjust based on your page numbering logic
  //   logPageVisit(page, currentPage);
  // };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen scroll-smooth flex flex-col md:flex-row transition-colors duration-300 bg-white dark:bg-gray-900`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedMetric={selectedMetric}
        handleMetricClick={handleMetricClick}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNavigate={handleNavigation} // Pass navigation handler to Sidebar
      />
      <div className="flex-1 ml-0 md:ml-0 transition-all duration-300">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          filter={filter}
          handleFilterChange={handleFilterChange}
          darkMode={darkMode}
        />
        <main className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px)', backgroundColor: darkMode ? '#1F2937' : '#F9FAFB' }}>
          {(!selectedMetric || selectedMetric === 'dashboard') && (
            <DashboardOverview
              activities={activities}
              users={users}
              handleMetricClick={handleMetricClick}
              activeChart={activeChart}
              setActiveChart={setActiveChart}
              trendChartRef={trendChartRef}
              typeChartRef={typeChartRef}
              darkMode={darkMode}
            />
          )}
          {selectedMetric === 'users' && (
            <UserManagement
              users={users}
              activities={activities}
              loading={loading}
              filter={filter}
              handleFilterChange={handleFilterChange}
              handleDeleteAllUsers={handleDeleteAllUsers}
              handleUserClick={handleUserClick}
              handleDeleteUser={handleDeleteUser}
              handleDeleteUserHistory={handleDeleteUserHistory}
              darkMode={darkMode}
            />
          )}
          {selectedMetric === 'activities' && (
            <ActivityLogs
              activities={activities}
              loading={loading}
              filter={filter}
              handleFilterChange={handleFilterChange}
              handleSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleDeleteActivity={handleDeleteActivity}
              darkMode={darkMode}
            />
          )}
          {selectedMetric === 'details' && (
            <UserActivityDetails
              activities={activities}
              users={users}
              darkMode={darkMode}
              onUserSelect={handleUserClick}
            />
          )}
          {loading && <LoadingIndicator darkMode={darkMode} />}
        </main>
      </div>
      <UserDetailsModal
        showUserDetailsModal={showUserDetailsModal}
        setShowUserDetailsModal={setShowUserDetailsModal}
        selectedUser={selectedUser}
        activities={activities}
        handleDeleteUser={handleDeleteUser}
        handleDeleteUserHistory={handleDeleteUserHistory}
        darkMode={darkMode}
      />
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          .dark .bg-white { background-color: #1F2937; }
          .dark .text-gray-800 { color: #F9FAFB; }
          .dark .text-gray-500 { color: #9CA3AF; }
          .dark .border-gray-200 { border-color: #4B5563; }
          .dark .hover:bg-gray-50 { background-color: #374151; }
          .dark .bg-gray-50 { background-color: #374151; }
          .dark .text-gray-700 { color: #D1D5DB; }
          .dark .text-gray-900 { color: #F9FAFB; }
          .dark .bg-gray-100 { background-color: #4B5563; }
          .dark .hover:bg-gray-100 { background-color: #6B7280; }
        `}
      </style>
    </div>
  );
}

export default UserTrackingFromExportPage;