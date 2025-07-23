import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const handleSignUp = () => {
    navigate('/NewUserLoginPage');
  };

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
    <div className="h-[92vh] px-20 justify-center items-center bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] flex flex-col font-['Inter',sans-serif] relative overflow-hidden">
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720">
          <path
            fill="#38BDF8"
            d="M0,400L60,373.3C120,347,240,293,360,293.3C480,293,600,347,720,373.3C840,400,960,400,1080,386.7C1200,373,1320,347,1380,333.3L1440,320L1440,720L1380,720C1320,720,1200,720,1080,720C960,720,840,720,720,720C600,720,480,720,360,720C240,720,120,720,60,720L0,720Z"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E2E8F0]/50" />
      </div>

      <main className="relative z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="text-center lg:text-left relative">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 leading-tight tracking-tight">
              Welcome to Triangle IP
            </h1>
            <p className="text-lg sm:text-xl text-[#64748B] mb-6 max-w-md mx-auto lg:mx-0">
              Your trusted platform for managing the US Patent Attorney Roster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                className="px-6 py-3 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-base font-medium rounded-lg hover:from-[#2B9FE7] hover:to-[#4B8EF1] transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                onClick={() => navigate('/explore')}
              >
                Explore Data
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-md mx-auto lg:mx-0 border border-[#38BDF8]/20 relative">
            <h2 className="text-2xl font-bold mb-6 text-center">Access Your Account</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-[#1E293B] mb-2">Select User Type</label>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <label
                    htmlFor="admin"
                    className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg cursor-pointer hover:bg-[#E2E8F0] transition-all duration-200"
                  >
                    <input
                      id="admin"
                      type="radio"
                      name="userType"
                      value="Admin"
                      onChange={(e) => setUserType(e.target.value)}
                      className="form-radio h-5 w-5 text-[#38BDF8] focus:ring-[#38BDF8]"
                    />
                    <span className="text-base font-medium">Admin</span>
                  </label>
                  <label
                    htmlFor="analyst"
                    className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg cursor-pointer hover:bg-[#E2E8F0] transition-all duration-200"
                  >
                    <input
                      id="analyst"
                      type="radio"
                      name="userType"
                      value="Patent Data Analyst"
                      onChange={(e) => setUserType(e.target.value)}
                      className="form-radio h-5 w-5 text-[#38BDF8] focus:ring-[#38BDF8]"
                    />
                    <span className="text-base font-medium">Patent Data Analyst</span>
                  </label>
                </div>
              </div>
              <button
                disabled={!userType}
                onClick={handleLogin}
                className={`w-full py-3 text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                  userType
                    ? 'bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] hover:from-[#2B9FE7] hover:to-[#4B8EF1] text-white'
                    : 'bg-[#CBD5E1] text-[#475569] cursor-not-allowed'
                }`}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
