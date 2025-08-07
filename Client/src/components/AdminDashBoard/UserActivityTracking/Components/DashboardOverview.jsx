import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineUser, HiOutlineClock, HiOutlineEye } from 'react-icons/hi';
import Chart from 'chart.js/auto';

const DashboardOverview = ({ activities, users, handleMetricClick, activeChart, setActiveChart, darkMode }) => {
  const userCount = users.length;
  const activityCount = activities.length;
  const trendChartRef = useRef(null);
  const typeChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const typeChartInstance = useRef(null);

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

  return (
    <div className="mb-8 animate-fadeIn">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>Dashboard Overview</h2>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => handleMetricClick('users')}
          className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-${darkMode ? 'gray-300' : 'gray-500'} uppercase text-sm font-medium`}>Total Users</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>{userCount}</p>
            </div>
            <div className={`bg-${darkMode ? 'blue-900' : 'blue-100'} p-3 rounded-full`}>
              <HiOutlineUser className={`h-6 w-6 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
            </div>
          </div>
        </div>

        <div
          onClick={() => handleMetricClick('activities')}
          className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-${darkMode ? 'gray-300' : 'gray-500'} uppercase text-sm font-medium`}>Total Activities</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>{activityCount}</p>
            </div>
            <div className={`bg-${darkMode ? 'green-900' : 'green-100'} p-3 rounded-full`}>
              <HiOutlineClock className={`h-6 w-6 ${darkMode ? 'text-green-300' : 'text-green-500'}`} />
            </div>
          </div>
        </div>

        <div className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-${darkMode ? 'gray-300' : 'gray-500'} uppercase text-sm font-medium`}>Active Today</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-2`}>
                {activities.filter(a => {
                  const today = new Date();
                  const activityDate = new Date(a.timestamp);
                  return activityDate.getDate() === today.getDate() &&
                    activityDate.getMonth() === today.getMonth() &&
                    activityDate.getFullYear() === today.getFullYear();
                }).length}
              </p>
            </div>
            <div className={`bg-${darkMode ? 'purple-900' : 'purple-100'} p-3 rounded-full`}>
              <HiOutlineEye className={`h-6 w-6 ${darkMode ? 'text-purple-300' : 'text-purple-500'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Activity Trend</h3>
            <div className="flex space-x-2">
              {['daily', 'weekly', 'monthly'].map(period => (
                <button
                  key={period}
                  onClick={() => setActiveChart(period)}
                  className={`
                    px-3 py-1 text-sm rounded-md
                    ${activeChart === period ? 'bg-blue-500 text-white' : `${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                    transition-all duration-200
                  `}
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

        <div className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Activity Distribution</h3>
          <div className="h-64">
            <canvas ref={typeChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Activities</h3>
          <button
            onClick={() => handleMetricClick('activities')}
            className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} text-sm font-medium hover:underline transition-colors duration-200`}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => (
            <div
              key={index}
              className={`
                flex items-start border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} pb-4 last:border-0
                transition-all duration-200 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}
              `}
            >
              <div className={`bg-${darkMode ? 'blue-900' : 'blue-100'} p-2 rounded-full mr-3`}>
                <HiOutlineClock className={`h-5 w-5 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{activity.email}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
                <p className={`text-${darkMode ? 'gray-300' : 'gray-600'} capitalize`}>
                  {activity.action?.replace('_', ' ')} - {activity.details?.page || activity.page || 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;