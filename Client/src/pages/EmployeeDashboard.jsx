import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import LiveSheet from "../components/EmployeeDashboard/LiveSheet";
import NewUploadExcel from "../components/EmployeeDashboard/NewUploadExcel";
import Note from "../components/EmployeeDashboard/note";
import NewProfiles from "../components/AdminDashBoard/IndivisualComponents/newProfiles";
import RemovedProfiles from "../components/AdminDashBoard/IndivisualComponents/removedProfiles";
import UpdatedProfiles from "../components/AdminDashBoard/IndivisualComponents/updatedProfiles";
import userdataimg from '../assets/userdata.png';
import fileuploading from '../assets/datauploading.mp4';
import empdashboardpreview from "../assets/empdashboardpreview.jpg";


// Home Component
const Home = () => {
  return (
    <div className="relative bg-white rounded-xl p-6 text-[#1E293B] text-center h-full flex flex-col">
      {/* Hero Section */}
      <div className="animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Welcome to Patent Analyst Dashboard
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
          Analyze live patent data, upload files, and manage notes with our intuitive tools.
          Explore your options below to get started.
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => document.querySelector(`[title="View Live Sheet"]`).click()}
            className="px-6 py-3 bg-white text-[#38BDF8] font-semibold rounded-lg hover:bg-[#F8FAFC] transition-all duration-200 shadow-md"
          >
            View Live Sheet
          </button>
          <button
            onClick={() => document.querySelector(`[title="View Upload"]`).click()}
            className="px-6 py-3 bg-transparent text-[#38BDF8] font-semibold rounded-lg hover:border-38BDF8 hover:border-2 hover:text-[#38BDF8] transition-all duration-200"
          >
            Start Upload
          </button>
          <button
            onClick={() => document.querySelector(`[title="View Note"]`).click()}
            className="px-6 py-3 bg-transparent text-[#38BDF8] font-semibold rounded-lg hover:border-38BDF8 hover:border-2 hover:text-[#38BDF8] transition-all duration-200"
          >
            Open Notes
          </button>
        </div>
      </div>

      {/* Featured Image */}
      <div className="w-full h-auto max-w-6xl mb-8 mx-auto">
        <div className="relative aspect-video bg-[#1E293B]/20 rounded-lg overflow-hidden">
          <img
            src={empdashboardpreview}
            alt="Patent Dashboard Preview"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="w-full max-w-6xl mx-auto space-y-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-[#38BDF8]/50 scrollbar-track-[#E2E8F0]">
        {/* Card 1: Live Data Preview */}
        <div className="bg-white/10 p-4 rounded-lg shadow-md animate-slideUp">
          <h3 className="text-xl font-semibold mb-2">Live Data Overview</h3>
          <img
            src={userdataimg}
            alt="Live Data Overview"
            className="w-full h-full object-cover rounded"
          />
          <p className="mt-2 text-sm">Monitor real-time patent updates and edits.</p>
        </div>

        {/* Card 2: Upload Demo */}
        <div className="bg-white/10 p-4 rounded-lg shadow-md animate-slideUp delay-100">
          <h3 className="text-xl font-semibold mb-2">File Upload Guide</h3>
          <div className="relative aspect-video bg-[#1E293B]/20 rounded-lg overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="https://via.placeholder.com/400x200?text=Upload+Demo"
            >
              <source
                src={fileuploading}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="mt-2 text-sm">Learn how to upload Excel files efficiently.</p>
        </div>

        {/* Card 3: Notes Preview */}
        <div className="bg-white/10 p-4 rounded-lg shadow-md animate-slideUp delay-200">
          <h3 className="text-xl font-semibold mb-2">Note-Taking</h3>
          <div className="w-full h-40 bg-gradient-to-br from-[#60A5FA] to-[#38BDF8] rounded flex items-center justify-center">
            <p className="text-white">Note Placeholder (5 Active Notes)</p>
          </div>
          <p className="mt-2 text-sm">Track your observations and updates.</p>
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

function EmployeeDashboard() {
  const [users, setUsers] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({ search: "" });
  const [activeCard, setActiveCard] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const rowsPerPage = 500;
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const [editedUsers, setEditedUsers] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [activeComponent, setActiveComponent] = useState("home");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    document.title = "Patent Analyst Dashboard";
    window.history.replaceState(null, "", window.location.pathname);
    const authToken = localStorage.getItem("authToken");
    const userType = localStorage.getItem("userType");
    if (!authToken || userType !== "employee") {
      toast.error("Unauthorized access. Please log in as a patent analyst.", {
        position: "top-center",
      });
      navigate("/");
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      
      const response = await axios.get(`${API_URL}/api/fetch-users?userId=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setUsers(response.data.data || []);
      setAllData(response.data.data || []);
      setFilteredData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users. Please check your connection or contact support.", {
        position: "top-center",
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/Login");
      }
    }
  };

  const handleFilterChange = (event) => {
    const value = event.target.value.toLowerCase();
    setFilters({ ...filters, search: value });
    setCurrentPage(1);
    setPageInput("");

    const filtered = allData.filter((user) =>
      [
        user.name,
        user.organization,
        user.addressLine1,
        user.addressLine2,
        user.city,
        user.state,
        user.country,
        user.zipcode,
        user.phoneNumber,
        user.regCode,
        user.agentAttorney,
        user.dateOfPatent,
        user.agentLicensed,
        user.firmOrOrganization,
        user.updatedPhoneNumber,
        user.emailAddress,
        user.updatedOrganization,
        user.firmUrl,
        user.updatedAddress,
        user.updatedCity,
        user.updatedState,
        user.updatedCountry,
        user.updatedZipcode,
        user.linkedInProfile,
        user.notes,
        user.initials,
        user.dataUpdatedAsOn,
      ].some((field) => field?.toString().toLowerCase().includes(value))
    );
    setFilteredData(filtered);
    setUsers(filtered);
  };

  const handleEdit = (id, field, value) => {
    setEditedUsers({
      ...editedUsers,
      [id]: { ...editedUsers[id], [field]: value },
    });
  };

  const handleUpdateAll = async () => {
    const updates = Object.keys(editedUsers)
      .filter((regCode) => Object.keys(editedUsers[regCode]).length > 0)
      .map((regCode) => ({ regCode, ...editedUsers[regCode] }));
    if (updates.length === 0) {
      toast.info("No changes to save.", { position: "top-center" });
      return;
    }
    try {
      
      await axios.put(`${API_URL}/api/update-users`, updates, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      fetchUsers();
      setEditedUsers({});
      toast.success("Data saved successfully", { position: "top-center" });
    } catch (error) {
      console.error("Error updating users:", error);
      toast.error(`Failed to save data: ${error.message || "Unknown error"}`, {
        position: "top-center",
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/Login");
      }
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setUsers(users.map((user) => ({ ...user, isChecked })));
  };

  const handleCheckboxChange = (id, isChecked) => {
    setUsers(users.map((user) => (user.regCode === id ? { ...user, isChecked } : user)));
    const allSelected = users.every((user) =>
      user.regCode === id ? isChecked : user.isChecked
    );
    setSelectAll(allSelected);
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const table = e.target.closest("table");
      const rows = table.querySelectorAll("tbody tr");
      const cols = rows[rowIndex].querySelectorAll("td");
      let newRowIndex = rowIndex;
      let newColIndex = colIndex;
      if (e.key === "ArrowUp" && rowIndex > 0) newRowIndex--;
      else if (e.key === "ArrowDown" && rowIndex < rows.length - 1) newRowIndex++;
      else if (e.key === "ArrowLeft" && colIndex > 1) newColIndex--;
      else if (e.key === "ArrowRight" && colIndex < cols.length - 2) newColIndex++;
      const newCell = rows[newRowIndex].querySelectorAll("td")[newColIndex];
      if (newCell && newCell.hasAttribute("contentEditable")) newCell.focus();
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleDropdownSelect = (component) => {
    setActiveComponent(component);
    setShowDropdown(false);
    setShowUpload(false);
  };

  const handleUploadClick = () => {
    setActiveComponent("upload");
    setShowUpload(true);
  };

  const handleUploadClose = () => {
    setShowUpload(false);
    setActiveComponent("liveSheet");
  };

  const handleUploadSuccess = () => {
    fetchUsers();
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageJump = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput(pageNumber);
    } else {
      toast.error("Invalid page number", { position: "top-center" });
      setPageInput(currentPage);
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: "fa-home", badge: 0 },
    { id: "liveSheet", label: "Live Sheet", icon: "fa-table", badge: users.length },
    { id: "upload", label: "Upload", icon: "fa-upload", badge: 0 },
    { id: "note", label: "Note", icon: "fa-chart-line", badge: 0 },
    { id: "updates", label: "Updates", icon: "fa-ellipsis-v", badge: 0 },
  ];

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      toast.success("Logged out successfully!", { position: "top-center" });
      navigate("/");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#CBD5E1] p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-[#64748B] focus:outline-none hover:text-[#38BDF8] transition-colors duration-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <i className={`fa-solid ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`} />
          </button>
          <h1 className="text-xl font-extrabold text-[#1E293B]">
            Patent Analyst Dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`px-4 py-2 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-sm font-semibold rounded-lg hover:from-[#2B9FE7] hover:to-[#4B8EF1] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg ${
            loading ? "opacity-50 cursor-not-allowed flex items-center justify-center" : ""
          }`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2 text-sm" /> Logging Out...
            </>
          ) : (
            "Log Out"
          )}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 w-full h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:${isSidebarOpen ? "translate-x-0 static w-64" : "translate-x-0 w-16"} z-40 fixed lg:static`}
        >
          <div className="p-4 h-full overflow-auto">
            <h2 className="text-lg font-extrabold text-[#1E293B] mb-6 flex items-center">
              <i className="fa-solid fa-tachometer-alt mr-2 text-[#38BDF8]" /> Dashboard
            </h2>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.id === "updates" ? (
                    <button
                      onClick={toggleDropdown}
                      className={`w-full flex items-center justify-between p-2 text-xs font-medium rounded-lg transition-all duration-200 hover:bg-[#F8FAFC] ${
                        activeComponent === "updates"
                          ? "bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white shadow-md"
                          : "text-[#64748B]"
                      }`}
                      title={`View ${item.label}`}
                    >
                      <span className="flex items-center gap-2">
                        <i className={`fa-solid ${item.icon} text-base`} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge > 0 && (
                        <span className="bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-semibold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (item.id === "upload") {
                          handleUploadClick();
                        } else {
                          setActiveComponent(item.id);
                          setShowUpload(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 text-xs font-medium rounded-lg transition-all duration-200 hover:bg-[#F8FAFC] ${
                        activeComponent === item.id || (item.id === "upload" && showUpload)
                          ? "bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white shadow-md"
                          : "text-[#64748B]"
                      }`}
                      title={`View ${item.label}`}
                    >
                      <span className="flex items-center gap-2">
                        <i className={`fa-solid ${item.icon} text-base`} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge > 0 && (
                        <span className="bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-semibold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )}
                  {item.id === "updates" && showDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#CBD5E1] rounded-lg shadow-xl min-w-[160px] z-10 animate-fadeIn">
                      <div
                        className="px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#F8FAFC] cursor-pointer transition-colors duration-200"
                        onClick={() => handleDropdownSelect("newProfiles")}
                      >
                        New Profiles
                      </div>
                      <div
                        className="px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#F8FAFC] cursor-pointer transition-colors duration-200"
                        onClick={() => handleDropdownSelect("removedProfiles")}
                      >
                        Removed Profiles
                      </div>
                      <div
                        className="px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#F8FAFC] cursor-pointer transition-colors duration-200"
                        onClick={() => handleDropdownSelect("updatedProfiles")}
                      >
                        Updated Profiles
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main
          className={`flex-1 p-6 overflow-auto transition-all ${
            isSidebarOpen ? "" : "w-full"
          } lg:${isSidebarOpen ? "flex-1" : "ml-16"}`}
        >
          <ErrorBoundary>
            <div className="bg-white rounded-xl shadow-md border border-[#CBD5E1] p-6">
              {activeComponent === "home" && <Home />}
              {activeComponent === "liveSheet" && (
                <LiveSheet
                  users={users}
                  filteredData={filteredData}
                  handleFilterChange={handleFilterChange}
                  filters={filters}
                  handleEdit={handleEdit}
                  handleUpdateAll={handleUpdateAll}
                  handleSelectAll={handleSelectAll}
                  handleCheckboxChange={handleCheckboxChange}
                  handleKeyDown={handleKeyDown}
                  editedUsers={editedUsers}
                  selectAll={selectAll}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pageInput={pageInput}
                  setPageInput={setPageInput}
                  rowsPerPage={rowsPerPage}
                  totalPages={totalPages}
                  handlePageJump={handlePageJump}
                  userId={userId}
                />
              )}
              {activeComponent === "upload" && showUpload && (
                <NewUploadExcel
                  userId={userId}
                  onClose={handleUploadClose}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
              {activeComponent === "note" && userId && <Note userId={userId} />}
              {activeComponent === "newProfiles" && <NewProfiles />}
              {activeComponent === "removedProfiles" && <RemovedProfiles />}
              {activeComponent === "updatedProfiles" && <UpdatedProfiles />}
            </div>
          </ErrorBoundary>
          <Outlet
            context={{
              users,
              allData,
              filteredData,
              handleFilterChange,
              filters,
              handleDeleteAlert: () => console.log("Delete Alert Triggered"),
              handleLogin: () => console.log("Login Function Called"),
              handleCardClick: (card) => setActiveCard(card),
              activeCard,
              showForm,
              toggleForm: () => setShowForm(!showForm),
              loading,
              email,
              setEmail,
            }}
          />
        </main>
      </div>

      {/* Inline CSS for Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
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
          .animate-slideIn {
            animation: slideIn 0.4s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.8s ease-out;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .scrollbar-thin::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          .scrollbar-thumb::-webkit-scrollbar-thumb {
            background-color: #38BDF8/50;
            border-radius: 2px;
          }
          .scrollbar-track::-webkit-scrollbar-track {
            background: #E2E8F0;
          }
        `}
      </style>
    </div>
  );
}

export default EmployeeDashboard;