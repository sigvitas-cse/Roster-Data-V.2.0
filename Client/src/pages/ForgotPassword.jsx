import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Forgot Password - Triangle IP';
    window.history.replaceState(null, '', window.location.pathname);
    if (localStorage.getItem('authToken')) {
      const storedUserId = localStorage.getItem('userId');
      const storedUserType = localStorage.getItem('userType') || 'employee';
      if (storedUserType === 'admin') {
        navigate('/AdminDashboard', { state: { userId: storedUserId } });
      } else {
        navigate('/EmployeeDashBoard', { state: { userId: storedUserId } });
      }
    }
  }, [navigate]);

 const API_URL = import.meta.env.VITE_API_URL;



  const requestOtp = async () => {
    setLoading(true);
    setMessage('⏳ Sending OTP...');
    setIsEmailError(false);

    try {
      const res = await axios.post(`${API_URL}/api/request-otp`, { email });
      toast.success(res.data.message || '✅ OTP sent successfully!', { position: 'top-center' });
      setMessage('');
      setStep(2);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong.';
      if (errMsg.toLowerCase().includes('email not registered')) {
        setMessage("🔔 We couldn't find your email. Please ensure it's correct or ");
        setIsEmailError(true);
      } else {
        toast.error(errMsg, { position: 'top-center' });
        setMessage('');
      }
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage('⏳ Verifying OTP...');

    try {
      const res = await axios.post(`${API_URL}/api/verify-otp`, { email, otp });
      toast.success(res.data.message || '✅ OTP Verified!', { position: 'top-center' });
      setMessage('');
      setStep(3);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid or expired OTP.';
      toast.error(errorMsg, { position: 'top-center' });
      setMessage('');
      if (errorMsg.toLowerCase().includes('expired')) {
        setShowResend(true);
      }
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('❌ Passwords do not match.', { position: 'top-center' });
      setMessage('');
      return;
    }

    setLoading(true);
    setMessage('⏳ Resetting password...');

    try {
      const res = await axios.post(`${API_URL}/api/reset-password`, { email, newPassword });
      toast.success(res.data.message || '✅ Password reset successfully!', { position: 'top-center' });
      setMessage('');
      setStep(4);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.', { position: 'top-center' });
      setMessage('');
    }
    setLoading(false);
  };

  const goToLogin = () => {
    navigate('/Login');
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] flex flex-col font-['Inter',sans-serif] relative overflow-hidden">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
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
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-[#1E293B]">
              Forgot Password
            </h2>

            {message && (
              <p className={`text-sm text-center mb-4 ${isEmailError ? 'text-red-500' : 'text-[#1E293B]'}`}>
                {message}
                {isEmailError && (
                  <Link to="/NewUserLoginPage" className="ml-1 text-[#38BDF8] font-medium hover:underline">
                    Register Now
                  </Link>
                )}
              </p>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-base font-medium text-[#1E293B] mb-2">
                    Registered Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                    aria-label="Email"
                  />
                </div>
                <button
                  onClick={requestOtp}
                  disabled={loading}
                  className={`w-full p-3 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                    loading ? 'bg-[#CBD5E1] cursor-not-allowed' : 'hover:from-[#2B9FE7] hover:to-[#4B8EF1] hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Sending OTP...' : 'Request OTP'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-base font-medium text-[#1E293B] mb-2">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                    aria-label="OTP"
                  />
                </div>
                {message && <p className="text-sm text-center text-[#1E293B]">{message}</p>}
                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className={`w-full p-3 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                    loading ? 'bg-[#CBD5E1] cursor-not-allowed' : 'hover:from-[#2B9FE7] hover:to-[#4B8EF1] hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                {showResend && (
                  <button
                    onClick={() => {
                      requestOtp();
                      setShowResend(false);
                    }}
                    className="w-full p-3 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#FBBF24] hover:from-[#F59E0B] hover:to-[#D97706] hover:shadow-lg"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-base font-medium text-[#1E293B] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full p-3 pr-12 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                      aria-label="New Password"
                    />
                    <span
                      onClick={toggleNewPasswordVisibility}
                      className={`fa ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200`}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-base font-medium text-[#1E293B] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full p-3 pr-12 rounded-lg text-base bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all duration-200 placeholder:text-[#64748B]"
                      aria-label="Confirm Password"
                    />
                    <span
                      onClick={toggleConfirmPasswordVisibility}
                      className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200`}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    />
                  </div>
                </div>
                {message && <p className="text-sm text-center text-[#1E293B]">{message}</p>}
                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className={`w-full p-3 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                    loading ? 'bg-[#CBD5E1] cursor-not-allowed' : 'hover:from-[#2B9FE7] hover:to-[#4B8EF1] hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-[#1E293B]">Success!</h3>
                <p className="text-base text-[#1E293B]">Your password has been reset. You can now login.</p>
                <button
                  onClick={goToLogin}
                  className="w-full p-3 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8] hover:from-[#2B9FE7] hover:to-[#4B8EF1] hover:shadow-lg"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
