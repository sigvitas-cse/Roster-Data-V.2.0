import React from 'react';
import { HiOutlineTrash } from 'react-icons/hi';
import axios from 'axios'; // Ensure axios is installed

const UserDetailsModal = ({ showUserDetailsModal, setShowUserDetailsModal, selectedUser, activities, handleDeleteUser, handleDeleteUserHistory }) => {
  const getUserDetails = (email) => {
    const userActivities = activities.filter(a => a.email === email);
    const latestActivity = userActivities.reduce((latest, current) => {
      return (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) ? current : latest;
    }, null);
    return {
      lastLogin: latestActivity?.timestamp ? new Date(latestActivity.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) : 'N/A',
      device: userActivities.find(a => a.details?.userAgent)?.details?.userAgent || 'N/A',
      copiedData: userActivities.filter(a => a.action === 'copy').map(a => `${a.details.name} (${a.details.regCode})`) || ['None'],
    };
  };

  if (!showUserDetailsModal || !selectedUser) return null;

  const userDetails = getUserDetails(selectedUser.email);

  const handleDeleteUserLocal = async (email) => {
    if (window.confirm(`Are you sure you want to delete the user ${email}? This action cannot be undone.`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(email)}`);
        handleDeleteUser(email); // Update parent state
        setShowUserDetailsModal(false);
        alert('User deleted successfully');
      } catch (err) {
        console.error('Delete user error:', err);
        alert(`Failed to delete user: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleDeleteUserHistoryLocal = async (email) => {
    if (window.confirm(`Are you sure you want to delete the history for ${email}? This action cannot be undone.`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(email)}/history`);
        handleDeleteUserHistory(email); // Update parent state
        setShowUserDetailsModal(false);
        alert('User history deleted successfully');
      } catch (err) {
        console.error('Delete history error:', err);
        alert(`Failed to delete history: ${err.message || 'Unknown error'}`);
      }
    }
  };

  return (
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
                  <p className="text-gray-500 dark:text-gray-400">Last activity: {userDetails.lastLogin}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Device Info</h5>
                <p className="text-gray-800 dark:text-white">{userDetails.device}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Copied Data</h5>
                <div className="text-gray-800 dark:text-white">
                  {userDetails.copiedData.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {userDetails.copiedData.map((item, i) => (
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
                onClick={() => handleDeleteUserLocal(selectedUser.email)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 flex items-center"
              >
                <HiOutlineTrash className="mr-2" />
                Delete User
              </button>
              <button
                onClick={() => handleDeleteUserHistoryLocal(selectedUser.email)}
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
  );
};

export default UserDetailsModal;