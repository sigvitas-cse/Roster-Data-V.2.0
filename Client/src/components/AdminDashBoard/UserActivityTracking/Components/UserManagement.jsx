import React from 'react';
import { HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';

const UserManagement = ({ users, activities, loading, filter, handleFilterChange, handleDeleteAllUsers, handleUserClick, handleDeleteUser, handleDeleteUserHistory }) => {
  return (
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
  );
};

export default UserManagement;