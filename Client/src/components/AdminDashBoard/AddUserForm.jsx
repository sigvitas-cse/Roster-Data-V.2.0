import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddUserForm = () => {
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;




  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email!');
      return;
    }
    setLoading(true);
    try {
      console.log('Sending request to:', `${API_URL}/api/save-employee-details`);
      const response = await axios.post(
        `${API_URL}/api/save-employee-details`,
        { email },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      console.log('Response:', response.data);
      toast.success(`${email} added successfully.`);
      setUsers([...users, { email, id: Date.now() }]); // Add unique ID for key
      setEmail('');
    } catch (err) {
      console.error('API Error:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'An error occurred while adding the user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#38BDF8]/70 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-w-1.5" style={{ scrollBehavior: 'smooth' }}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      <div className="bg-white border border-[#CBD5E1] rounded-md shadow-sm">
        <div className="bg-[#38BDF8]/80 text-white p-1 rounded-t-md">
          <h2 className="text-[12px] font-semibold text-center">Create User</h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#64748B] mb-1">Email:</label>
              <input
                type="email"
                value={email}
                placeholder="Enter Email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[11px] focus:border-blue-500 focus:ring-1 focus:ring-blue-300 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white text-[11px] font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </form>
          {users.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[12px] font-semibold text-[#1E293B] mb-2 text-center">Added Users</h3>
              <div className="max-h-[200px] overflow-y-auto">
                <ul className="list-none p-0 space-y-2">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className="bg-gray-50 p-2 rounded-md border border-gray-200 text-[11px] hover:bg-gray-100 transition-colors"
                    >
                      {user.email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;