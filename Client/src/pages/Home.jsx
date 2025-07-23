import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import techBackground from '../assets/Indivisuals/indivisualbg9.jpg'; // Place a downloaded tech image here

const Home = () => {
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Triangle IP - US Patent Attorney Roster';
    window.history.replaceState(null, '', window.location.pathname);

    const token = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUserType = localStorage.getItem('userType');

    if (token && storedUserId) {
      if (storedUserType === 'admin') {
        navigate('/AdminDashboard', { state: { userId: storedUserId } });
      } else if (storedUserType === 'employee') {
        navigate('/EmployeeDashBoard', { state: { userId: storedUserId } });
      } else if (storedUserType === 'multiple') {
        navigate('/explore');
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    if (userType === 'Admin') {
      navigate('/Login', { state: { userType: 'admin' } });
    } else if (userType === 'Patent Data Analyst') {
      navigate('/Login', { state: { userType: 'employee' } });
    } else {
      toast.error('Please select a user type', { position: 'top-center' });
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 sm:px-6"
      
    >
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Left Side */}
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Welcome to Triangle IP
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-6">
            Manage the US Patent Attorney Roster with clarity and power.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="inline-block bg-gradient-to-r from-sky-500 to-blue-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold shadow hover:from-sky-600 hover:to-blue-600 transition-all"
          >
            Explore Patent Data
          </button>
        </div>

        {/* Right Side - Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-4">Access Your Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select User Type</label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 p-2 sm:p-3 bg-sky-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-sky-100">
                  <input
                    type="radio"
                    name="userType"
                    value="Admin"
                    onChange={(e) => setUserType(e.target.value)}
                    className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-sky-500"
                  />
                  <span className="text-gray-800 font-medium">Admin</span>
                </label>
                <label className="flex items-center gap-2 p-2 sm:p-3 bg-sky-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-sky-100">
                  <input
                    type="radio"
                    name="userType"
                    value="Patent Data Analyst"
                    onChange={(e) => setUserType(e.target.value)}
                    className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-sky-500"
                  />
                  <span className="text-gray-800 font-medium">Patent Data Analyst</span>
                </label>
              </div>
            </div>

            <button
              disabled={!userType}
              onClick={handleLogin}
              className={`w-full py-2 sm:py-3 rounded-xl font-semibold text-white transition-all ${
                userType
                  ? 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Log In
            </button>

            <p className="text-sm sm:text-base text-center text-gray-600 mt-3">
              New user?{' '}
              <button
                onClick={() => navigate('/NewUserLoginPage')}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign Up Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
