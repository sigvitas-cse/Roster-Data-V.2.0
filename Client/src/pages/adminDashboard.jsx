import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AttorneyRoster from "../components/AdminDashBoard/AttorneyRoster.jsx";
import Users from "../components/AdminDashBoard/UsersTable.jsx";
import AddUserForm from "../components/AdminDashBoard/AddUserForm.jsx";
import Analysis from "../components/AdminDashBoard/Analysis.jsx";
import alldata from "../assets/alldata.png";
import UsersImage from "../assets/users.png";
import analysis from "../assets/analysis.png";
import AdminImage from "../assets/AdminDashboardFeatures.mp4";


// Welcome Component with Enhanced Content
const Welcome = () => {
  return (
    <div className="relative bg-white rounded-xl p-8 text-black text-center h-full flex flex-col">
      {/* Hero Section */}
      <div className="animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Welcome to Triangle IP Admin Dashboard
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-auto">
          Manage users, analyze data, and streamline your workflow with our powerful tools.
          Get started by selecting an option from the sidebar.
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => document.querySelector(`[title="View Users"]`).click()}
            className="px-6 py-3 bg-white text-[#38BDF8] font-semibold rounded-lg hover:bg-[#F8FAFC] transition-all duration-200 shadow-md"
          >
            Manage Users
          </button>
          <button
            onClick={() => document.querySelector(`[title="View Analysis"]`).click()}
            className="px-6 py-3 bg-transparent text-[#38BDF8] font-semibold rounded-lg hover:border-38BDF8 hover:border-2 hover:text-[#38BDF8] transition-all duration-200"
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Featured Image */}
      <div className="w-full max-w-6xl mb-8 mx-auto">
        <div className="relative aspect-video bg-[#1E293B]/20 rounded-lg overflow-hidden">
          <img
            src={alldata}
            alt="Triangle IP Dashboard Preview"
            className="w-full h-200 object-cover"
          />
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="w-full max-w-6xl mx-auto space-y-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-[#38BDF8]/50 scrollbar-track-[#E2E8F0]">
        {/* Card 1: Image */}
        <div className="bg-white/10 p-4 rounded-lg shadow-md animate-slideUp">
          <h3 className="text-xl font-semibold mb-2">Dashboard Overview</h3>
          <img
            src={analysis}
            alt="Dashboard Overview"
            className="w-full h-100 object-cover rounded"
          />
          {/* <p className="mt-2 text-sm">Explore the main features of your admin panel.</p> */}
        </div>

        {/* Card 2: Video Placeholder */}
        <div className="bg-white/10 p-4 rounded-lg shadow-md animate-slideUp delay-100">
          <h3 className="text-xl font-semibold mb-2">Feature Demo</h3>
          <div className="relative aspect-video bg-[#1E293B]/20 rounded-lg overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="https://via.placeholder.com/400x200?text=Video+Loading"
            >
              <source
                src={AdminImage}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* <p className="mt-2 text-sm">Watch a short demo of the dashboard in action.</p> */}
        </div>

        {/* Card 3: Analysis Preview */}
        <div className="bg-white/10 p-4 rounded-lg shadow-md animate-slideUp delay-200">
          <h3 className="text-xl font-semibold mb-2">User Analytics</h3>
          <div className="w-full h-40 bg-gradient-to-br from-[#60A5FA] to-[#38BDF8] rounded flex items-center justify-center">
            <p className="text-white">Chart Placeholder (11 Active Users)</p>
          </div>
          <p className="mt-2 text-sm">View real-time user statistics and trends.</p>
        </div>

        {/* Card 4: Image */}
        <div className="bg-white/10 p-4 rounded-lg shadow-md animate-slideUp delay-300">
          <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
          <img
            src={UsersImage}
            alt="Team Collaboration"
            className="w-full h-100 object-cover rounded"
          />
          {/* <p className="mt-2 text-sm">Manage your attorney roster efficiently.</p> */}
        </div>
      </div>

      {/* Optional Animation for Visual Appeal */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 animate-pulse" />
    </div>
  );
};

// ErrorBoundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    toast.error("An error occurred. Please try again or contact support.", {
      position: "top-center",
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-600">
          <h2 className="text-xl font-bold">Something Went Wrong</h2>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-[#38BDF8] text-white rounded-lg hover:bg-[#2B9FE7] transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("welcome"); // Default to "welcome"
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Dashboard";
    window.history.replaceState(null, "", window.location.pathname);
    const authToken = localStorage.getItem("authToken");
    const userType = localStorage.getItem("userType");
    if (!authToken || userType !== "admin") {
      toast.error("Unauthorized access. Please log in as an admin.", {
        position: "top-center",
      });
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      toast.success("Logged out successfully!", { position: "top-center" });
      navigate("/");
    }, 500);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { id: "welcome", label: "Home", icon: "fa-home", badge: 0 },
    { id: "users", label: "Users", icon: "fa-users", badge: 15 },
    { id: "patentData", label: "Attorney Roster", icon: "fa-cloud", badge: 52752 },
    { id: "analysis", label: "Analysis", icon: "fa-chart-simple", badge: 0 },
    { id: "addUserForm", label: "Add User", icon: "fa-user-plus", badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] flex flex-col box-border">
      {/* Header */}
      <header className="bg-white border-b border-[#CBD5E1] p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-[#64748B] focus:outline-none hover:text-[#38BDF8] transition-colors duration-200"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className={`fa-solid ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`} />
          </button>
          <h1 className="text-2xl font-extrabold text-[#1E293B]">Triangle IP Admin</h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`px-4 py-2 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-sm font-semibold rounded-lg hover:from-[#2B9FE7] hover:to-[#4B8EF1] transition-all duration-200 shadow-md hover:shadow-lg ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging Out..." : "Log Out"}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 w-full h-full box-border">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:${isSidebarOpen ? "translate-x-0 static w-64" : "translate-x-0 w-16"} z-40 fixed lg:static`}
        >
          <div className="p-4 h-full overflow-auto box-border">
            <h2 className="text-xl font-extrabold text-[#1E293B] mb-6 flex items-center">
              <i className="fa-solid fa-tachometer-alt mr-2 text-[#38BDF8]" /> Dashboard
            </h2>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[#F8FAFC] ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white shadow-md"
                      : "text-[#64748B]"
                  }`}
                  title={`View ${item.label}`}
                >
                  <span className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} text-lg`} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge > 0 && (
                    <span className="bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-semibold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main
          className={`flex-1 p-6 overflow-auto transition-all box-border ${
            isSidebarOpen ? "" : "w-full"
          } lg:${isSidebarOpen ? "flex-1" : "ml-16"}`}
        >
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-1 gap-0 box-border">
            <ErrorBoundary>
              <div className="lg:col-span-1 bg-white rounded-xl shadow-md border border-[#CBD5E1] p-6 w-full box-border">
                {activeSection !== "welcome" && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-[#1E293B] mb-2">
                      {navItems.find((item) => item.id === activeSection)?.label}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] rounded" />
                  </div>
                )}
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <i className="fa-solid fa-spinner fa-spin text-[#38BDF8] text-4xl" />
                  </div>
                ) : (
                  <>
                    {activeSection === "welcome" && <Welcome />}
                    {activeSection === "users" && <Users />}
                    {activeSection === "patentData" && <AttorneyRoster />}
                    {activeSection === "analysis" && <Analysis />}
                    {activeSection === "addUserForm" && <AddUserForm />}
                  </>
                )}
              </div>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Inline CSS for Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.8s ease-out;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-thumb::-webkit-scrollbar-thumb {
            background-color: #38BDF8/50;
            border-radius: 3px;
          }
          .scrollbar-track::-webkit-scrollbar-track {
            background: #E2E8F0;
          }
        `}
      </style>
    </div>
  );
}

export default AdminDashboard;