import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NewUserLoginPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Register - Triangle IP';
    window.history.replaceState(null, '', window.location.pathname);
    if (localStorage.getItem('authToken')) {
      navigate('/', { state: { userId: localStorage.getItem('userId') } });
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (password !== rePassword) {
      toast.error('Passwords must match', { position: 'top-center' });
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      toast.error('Please enter a valid email address', { position: 'top-center' });
      return;
    }

  const API_URL = import.meta.env.VITE_API_URL;




    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/save-new-employee-details`, {
        firstName,
        lastName,
        email,
        contact,
        password,
        userType: 'employee',
      });

      if (response.status === 200) {
        const { user, token } = response.data;
        if (user) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userId', user.userId || email);
          toast.success(`Welcome, ${user.firstName} ${user.lastName}`, { position: 'top-center' });
          navigate('/');
        } else {
          toast.error('Error: User data not found', { position: 'top-center' });
        }
      } else {
        toast.error('Failed to save user data', { position: 'top-center' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || 'An error occurred while registering. Please try again later.', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] flex flex-col font-['Inter',sans-serif] relative overflow-hidden">
      {/* Enhanced Background Shape */}
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720">
          <path
            fill="#38BDF8"
            d="M0,500C200,400,400,600,600,500S1000,400,1200,500C1300,550,1400,500,1440,450V720H0V500Z"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E2E8F0]/70" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-xl px-4 sm:px-6 py-10 sm:py-12">
          {/* Form Card */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-[#E2E8F0] transition-all duration-300 hover:shadow-xl">
            {/* Heading and Subtitle */}
            <h3 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-[#1E293B]">
              New User Registration
            </h3>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-[#1E293B] mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-base font-medium text-[#1E293B] mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter First Name"
                      minLength={5}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-3 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-base font-medium text-[#1E293B] mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Enter Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-base font-medium text-[#1E293B] mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter Email Address"
                      minLength={8}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                      required
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="sm:col-span-2">
                    <label htmlFor="contact" className="block text-base font-medium text-[#1E293B] mb-2">
                      Contact Number
                    </label>
                    <input
                      id="contact"
                      type="tel"
                      placeholder="Enter Contact Number"
                      minLength={10}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full p-3 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              <div>
                <h4 className="text-lg font-semibold text-[#1E293B] mb-4">Set Your Credentials</h4>
                <div className="grid grid-cols-1 gap-3">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-base font-medium text-[#1E293B] mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Set Password"
                        minLength={5}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 pr-12 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                        required
                      />
                      <span
                        onClick={togglePasswordVisibility}
                        className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </div>
                  </div>

                  {/* Re-Enter Password */}
                  <div>
                    <label htmlFor="rePassword" className="block text-base font-medium text-[#1E293B] mb-2">
                      Re-Enter Password
                    </label>
                    <div className="relative">
                      <input
                        id="rePassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-Enter Password"
                        minLength={5}
                        value={rePassword}
                        onChange={(e) => setRePassword(e.target.value)}
                        className="w-full p-3 pr-12 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                        required
                      />
                      <span
                        onClick={togglePasswordVisibility}
                        className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-40 p-3 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                    loading
                      ? 'bg-[#CBD5E1] cursor-not-allowed'
                      : 'hover:from-[#2B9FE7] hover:to-[#4B8EF1] hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
                <button
                  onClick={goBack}
                  className="w-full sm:w-40 p-3 bg-[#E2E8F0] text-[#1E293B] text-base font-semibold rounded-lg hover:bg-[#CBD5E1] transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NewUserLoginPage;