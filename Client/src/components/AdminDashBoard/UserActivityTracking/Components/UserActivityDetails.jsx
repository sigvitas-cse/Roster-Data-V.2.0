import React, { useState, useEffect } from 'react';

const UserActivityDetails = ({ activities, users, darkMode, onUserSelect }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [dailyStats, setDailyStats] = useState({});

  useEffect(() => {
    if (selectedUser) {
      const userActivities = activities.filter(a => a.email === selectedUser.email);
      const stats = {};

      userActivities.forEach(activity => {
        if (activity.timestamp) {
          const date = new Date(activity.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          if (!stats[date]) {
            stats[date] = { logins: [], firstLogin: null, lastLogout: null };
          }

          if (activity.action === 'login') {
            stats[date].logins.push(new Date(activity.timestamp));
            if (!stats[date].firstLogin || new Date(activity.timestamp) < stats[date].firstLogin) {
              stats[date].firstLogin = new Date(activity.timestamp);
            }
          } else if (activity.action === 'logout') {
            if (!stats[date].lastLogout || new Date(activity.timestamp) > stats[date].lastLogout) {
              stats[date].lastLogout = new Date(activity.timestamp);
            }
          }
        }
      });

      Object.keys(stats).forEach(date => {
        const logins = stats[date].logins.length;
        const firstLogin = stats[date].firstLogin;
        const lastLogout = stats[date].lastLogout;
        const hoursLogged = lastLogout && firstLogin
          ? (lastLogout - firstLogin) / (1000 * 60 * 60)
          : 0;

        stats[date] = {
          loginCount: logins,
          hoursLogged: hoursLogged.toFixed(2),
          firstLogin: firstLogin?.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
          }) || 'N/A',
          lastLogout: lastLogout?.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
          }) || 'N/A',
        };
      });

      setDailyStats(stats);
    }
  }, [selectedUser, activities]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    if (onUserSelect) onUserSelect(user);
  };

  return (
    <div className={`bg-${darkMode ? 'gray-700' : 'white'} p-6 rounded-lg shadow-md mb-8 animate-fadeIn`}>
      {!selectedUser ? (
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Activity Details</h2>
          <ul className="mt-4 space-y-2">
            {users.map(user => (
              <li
                key={user.email}
                onClick={() => handleUserClick(user)}
                className={`
                  cursor-pointer p-2 rounded
                  ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}
                  transition-colors duration-200 flex justify-between items-center
                `}
              >
                <span>{user.email}</span>
                <span className="text-gray-400 text-2xl">➕</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedUser(null)}
            className={`
              mb-4 px-4 py-2 rounded
              ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
              transition-colors duration-200
            `}
          >
            Back to Users
          </button>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Activity Details for {selectedUser.email}
          </h2>
          <div className="mt-4 space-y-4">
            {Object.keys(dailyStats).length > 0 ? (
              Object.keys(dailyStats).map(date => (
                <div
                  key={date}
                  className={`p-4 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-50'} border ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}
                >
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{date}</h3>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Login Count:</strong> {dailyStats[date].loginCount}</li>
                    <li><strong>Hours Logged:</strong> {dailyStats[date].hoursLogged} hrs</li>
                    <li><strong>First Login:</strong> {dailyStats[date].firstLogin}</li>
                    <li><strong>Last Logout:</strong> {dailyStats[date].lastLogout}</li>
                  </ul>
                </div>
              ))
            ) : (
              <p className={`text-${darkMode ? 'gray-400' : 'gray-500'}`}>No activity data available for this user.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityDetails;