import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve userType from navigation state
  const userType = location.state?.userType || '';

  useEffect(() => {
    document.title = 'Login - Triangle IP';
    window.history.replaceState(null, '', window.location.pathname);

    // If userType is not provided, redirect to Home
    if (!userType) {
      toast.error('Please select a user type on the home page', { position: 'top-center' });
      navigate('/');
      return;
    }

    // If user is authenticated, navigate to appropriate dashboard
    if (localStorage.getItem('authToken')) {
      const storedUserId = localStorage.getItem('userId');
      const storedUserType = localStorage.getItem('userType') || userType;
      if (storedUserType === 'admin') {
        navigate('/AdminDashboard', { state: { userId: storedUserId } });
      } else {
        navigate('/EmployeeDashBoard', { state: { userId: storedUserId } });
      }
    }
  }, [navigate, userType]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId || !password) {
      toast.error('Please enter both User ID and Password', { position: 'top-center' });
      return;
    }

    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL;



    try {
      const response = await axios.post(`${API_URL}/api/check-login`, { userId, password, userType });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userType', userType); // Persist userType
        toast.success('Login successful!', { position: 'top-center' });
        if (userType === 'admin') {
          navigate('/AdminDashboard');
        } else {
          navigate('/EmployeeDashBoard', { state: { userId } });
        }
      } else {
        toast.error('Invalid credentials. Please try again.', { position: 'top-center' });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred while logging in. Please try again later.', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/ForgotPassword');
  };

  return (
    <div className="bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] flex flex-col font-['Inter',sans-serif] relative overflow-hidden">
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720">
          <path
            fill="#38BDF8"
            d="M0,400L60,373.3C120,347,240,293,360,293.3C480,293,600,347,720,373.3C840,400,960,400,1080,386.7C1200,373,1320,347,1380,333.3L1440,320L1440,720L1380,720C1320,720,1200,720,1080,720C960,720,840,720,720,720C600,720,480,720,360,720C240,720,120,720,60,720L0,720Z"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E2E8F0]/50" />
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md px-4 sm:px-6 py-10 sm:py-12">
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-[#E2E8F0] transition-all duration-300 hover:shadow-xl">
            <h3 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-[#1E293B]">
              {userType === 'admin' ? 'Admin Login' : 'Patent Data Analyst Login'}
            </h3>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="userId" className="block text-base font-medium text-[#1E293B] mb-2">
                  User ID
                </label>
                <input
                  id="userId"
                  type="text"
                  placeholder="Enter User ID"
                  minLength={8}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full p-3 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                  aria-label="User ID"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-medium text-[#1E293B] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-12 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                    aria-label="Password"
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  />
                </div>
              </div>

              <div className="text-right">
                <p
                  onClick={handleForgotPassword}
                  className="text-base text-[#38BDF8] cursor-pointer hover:underline transition-all duration-200"
                >
                  Forgot Password?
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full p-3 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                  loading
                    ? 'bg-[#CBD5E1] cursor-not-allowed'
                    : 'hover:from-[#2B9FE7] hover:to-[#4B8EF1] hover:shadow-lg'
                }`}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;