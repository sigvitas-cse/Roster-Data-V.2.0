import React, { useEffect, useState } from 'react';
  import { HiOutlineSearch, HiOutlineTrash } from 'react-icons/hi';
  import axios from 'axios'; // Ensure axios is installed

  const ActivityLogs = ({ activities, loading, filter, handleFilterChange, handleSort, sortBy, sortOrder, handleDeleteActivity, darkMode }) => {
    // Flatten activities with nested $date timestamps
    const flattenedActivities = activities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp || null, // Simplified timestamp handling
      email: activity.email || (activities.length && activities[0].email) || 'N/A',
      details: activity.details || {},
    }));

    const filteredActivities = flattenedActivities
      .filter(activity =>
        activity.action?.toLowerCase().includes(filter.toLowerCase()) ||
        activity.email?.toLowerCase().includes(filter.toLowerCase()) ||
        (activity.timestamp && new Date(activity.timestamp).toLocaleString().toLowerCase().includes(filter.toLowerCase())) ||
        (activity.details?.page?.toLowerCase().includes(filter.toLowerCase()) || '')
      )
      .sort((a, b) => {
        if (sortBy === 'timestamp') {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return sortOrder === 'asc' ? a[sortBy]?.localeCompare(b[sortBy]) : b[sortBy]?.localeCompare(a[sortBy]);
      });

    console.log('Filtered Activities:', filteredActivities); // Debug log

    // Debug log to check timestamp
    useEffect(() => {
      flattenedActivities.forEach((activity, index) => {
        console.log(`Activity ${index}:`, activity.timestamp, typeof activity.timestamp);
      });
    }, [flattenedActivities]);

    // State for delete operation
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (email, timestamp) => {
      if (window.confirm(`Are you sure you want to delete the activity for ${email} at ${new Date(timestamp).toLocaleString()}?`)) {
        setDeleting(timestamp);
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/activity/${encodeURIComponent(email)}/${encodeURIComponent(timestamp)}`);
          handleDeleteActivity(email, timestamp);
          alert('Activity deleted successfully');
        } catch (err) {
          console.error('Delete error:', err);
          alert(`Failed to delete activity: ${err.message || 'Unknown error'}`);
        } finally {
          setDeleting(null);
        }
      }
    };

    return (
      <div className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md mb-8 animate-fadeIn`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Activity Logs</h2>
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Filter by action, email, page, or date..."
              value={filter}
              onChange={handleFilterChange}
              className={`
                w-full pl-10 pr-4 py-2 border
                ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-800'}
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200
              `}
            />
            <HiOutlineSearch className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`bg-${darkMode ? 'gray-600' : 'gray-50'}`}>
              <tr>
                <th
                  onClick={() => handleSort('email')}
                  className={`
                    px-6 py-3 text-xs font-medium
                    ${darkMode ? 'text-gray-300' : 'text-gray-500'}
                    uppercase tracking-wider cursor-pointer
                    ${darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-100'}
                    transition-colors duration-200
                  `}
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
                  className={`
                    px-6 py-3 text-xs font-medium
                    ${darkMode ? 'text-gray-300' : 'text-gray-500'}
                    uppercase tracking-wider cursor-pointer
                    ${darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-100'}
                    transition-colors duration-200
                  `}
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
                  className={`
                    px-6 py-3 text-xs font-medium
                    ${darkMode ? 'text-gray-300' : 'text-gray-500'}
                    uppercase tracking-wider cursor-pointer
                    ${darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-100'}
                    transition-colors duration-200
                  `}
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
                  className={`
                    px-6 py-3 text-xs font-medium
                    ${darkMode ? 'text-gray-300' : 'text-gray-500'}
                    uppercase tracking-wider cursor-pointer
                    ${darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-100'}
                    transition-colors duration-200
                  `}
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
                <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`bg-${darkMode ? 'gray-700' : 'white'} divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="animate-pulse space-y-2">
                      {Array(5).fill().map((_, i) => (
                        <div key={i} className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-full`}></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index) => (
                  <tr
                    key={index}
                    className={`hover:${darkMode ? 'bg-gray-600' : 'bg-gray-50'} transition-all duration-200`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} capitalize`}>
                        {activity.action?.replace('_', ' ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {activity.details?.page || activity.page || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {activity.timestamp
                          ? new Date(activity.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(activity.email, activity.timestamp)}
                        disabled={deleting === activity.timestamp}
                        className={`
                          ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}
                          transition-colors duration-200
                          ${deleting === activity.timestamp ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {HiOutlineTrash ? (
                          <HiOutlineTrash className="h-5 w-5" />
                        ) : (
                          <span className="text-red-500">[Icon Missing]</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`px-6 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No activities found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  export default ActivityLogs;