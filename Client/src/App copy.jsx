import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Outlet, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import techBackground from './assets/bg/bg2.jpg'; // Place a downloaded tech image here
import techBackground2 from './assets/bg/bg4.jpg'; // Place a downloaded tech image here



function App() {
  const location = useLocation();
  
  console.log(`Current Route at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}:`, location.pathname);

  const [users, setUsers] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeCard, setActiveCard] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleDeleteAlert = () => {
    console.log('Delete Alert Triggered');
  };

  const handleLogin = () => {
    console.log('Login Function Called');
  };

  const handleCardClick = (card) => {
    setActiveCard(card);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  const hidePaths = [
  '/AdminDashboard',
  '/EmployeeDashBoard',
  '/explore',
  '/bigdata'
];

const showHeader = !(
  hidePaths.includes(location.pathname.replace(/\/$/, '')) ||
  location.pathname.startsWith('/profile/')
);

  // Enhanced condition to handle variations in pathname
  // const showHeader = !['/AdminDashboard', '/AdminDashboard/','/EmployeeDashBoard', '/EmployeeDashBoard/', '/explore', '/explore/', '/bigdata', '/bigdata/', '/profile/:id/', '/profile/:id'].includes(location.pathname);
  console.log('Show Header:', showHeader, 'for pathname:', location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] font-['Inter',sans-serif]">
      {showHeader && <Header />}
      <main className="flex-1 flex items-center justify-center px-0 sm:py-0 sm:px-0 py-0 "
      style={{
              backgroundImage: `url(${techBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
        {/* <div className="max-w-7xl w-full" */}
        {/* <div className="max-w-[1600px] w-full" */}
        <div className="max-w-full w-full"

        style={{
              backgroundImage: `url(${techBackground2})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
          <Outlet
            context={{
              users,
              allData,
              filteredData,
              handleFilterChange,
              filters,
              handleDeleteAlert,
              handleLogin,
              handleCardClick,
              activeCard,
              showForm,
              toggleForm,
              loading,
              email,
              setEmail,
            }}
          />
        </div>
      </main>
      {['/', '/Login', '/NewUserLoginPage', '/ForgotPassword','/contact','/about'].includes(location.pathname) && <Footer />}

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

    </div>
  );
}

export default App;