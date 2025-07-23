import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "@fortawesome/fontawesome-free/css/all.min.css";

const LiveSheet = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const [filter, setFilter] = useState("");
  const [editedUsers, setEditedUsers] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 500;
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    document.title = "Patent Analyst Dashboard";
    window.history.replaceState(null, "", window.location.pathname);
    if (!userId) {
      navigate("/Login");
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  const fetchUsers = () => {
    console.log("UserId being sent to backend:", userId);
    axios
      .get(`${API_URL}/api/fetch-users?userId=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      })
      .then((response) => {
        console.log("Response from backend:", response.data);
        setUsers(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users", { position: "top-center" });
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/Login");
        }
      });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
    setPageInput("");
  };

  const handleEdit = (id, field, value) => {
    setEditedUsers({
      ...editedUsers,
      [id]: {
        ...editedUsers[id],
        [field]: value,
      },
    });
  };

  const handleUpdateAll = async () => {
    const updates = Object.keys(editedUsers)
      .filter((regCode) => Object.keys(editedUsers[regCode]).length > 0)
      .map((regCode) => ({
        regCode,
        ...editedUsers[regCode],
      }));

    if (updates.length === 0) {
      toast.info("No changes to save.", { position: "top-center" });
      return;
    }

    console.log("Sending updates to backend:", updates);

    const batchSize = 500;
    const batches = [];
    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize));
    }

    try {
      for (const batch of batches) {
        await axios.put(`${API_URL}/api/update-users`, batch, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        console.log(`Batch of ${batch.length} users updated successfully`);
      }
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

      if (e.key === "ArrowUp" && rowIndex > 0) {
        newRowIndex = rowIndex - 1;
      } else if (e.key === "ArrowDown" && rowIndex < rows.length - 1) {
        newRowIndex = rowIndex + 1;
      } else if (e.key === "ArrowLeft" && colIndex > 1) {
        newColIndex = colIndex - 1;
      } else if (e.key === "ArrowRight" && colIndex < cols.length - 2) {
        newColIndex = colIndex + 1;
      }

      const newCell = rows[newRowIndex].querySelectorAll("td")[newColIndex];
      if (newCell && newCell.hasAttribute("contentEditable")) {
        newCell.focus();
      }
    }
  };

  const updating = () => {
    setLoading(!loading);
    if (loading) {
      toast.success("Data edited successfully", { position: "top-center" });
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const searchableFields = [
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
    ];
    return searchableFields.some((field) =>
      field?.toString().toLowerCase().includes(filter.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(currentPage + 1);
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

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

  const handlePageInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePageJump();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-1.5">
          <i className="fa-solid fa-table text-[#38BDF8] text-base" />
          User Management
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 text-[#64748B] text-sm" />
            <input
              type="text"
              placeholder="Filter by any field"
              value={filter}
              onChange={handleFilterChange}
              className="pl-8 pr-2.5 py-1.5 border border-[#CBD5E1] rounded-lg text-xs w-full sm:w-60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#60A5FA]/20"
            />
          </div>
          <button
            onClick={handleUpdateAll}
            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <i className="fa-solid fa-save mr-1.5 text-xs" />
            Save
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto border border-[#CBD5E1] rounded-lg bg-white shadow-md h-[calc(100vh-300px)]  scrollbar-thin scrollbar-thumb scrollbar-track">
        <table className="w-full border-collapse text-[11px] font-sans">
          <thead className="sticky top-0 bg-[#F8FAFC] z-10">
            <tr>
              {[
                "S. No.",
                "Name",
                "Organization",
                "Address Line 1",
                "Address Line 2",
                "City",
                "State",
                "Country",
                "Zipcode",
                "Phone Number",
                "Reg No.",
                "Attorney",
                "Date of Patent",
                "Agent Licensed",
                "Firm or Organization",
                "Updated Phone Number",
                "Email Address",
                "Updated Organization/Law Firm Name",
                "Firm/Organization URL",
                "Updated Address",
                "Updated City",
                "Updated State",
                "Updated Country",
                "Updated Zipcode",
                "LinkedIn Profile URL",
                "Notes",
                "Initials",
                "Data Updated as on",
                "All",
                "Actions",
              ].map((header, index) => (
                <th
                  key={index}
                  className="p-2 text-left font-semibold text-[#1E293B] border-b border-r border-[#E2E8F0] whitespace-nowrap text-[11px]"
                >
                  {header === "All" ? (
                    <div className="flex justify-center">
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                    </div>
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr
                key={user.regCode}
                className={`hover:bg-[#F8FAFC] ${index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"} transition-colors duration-200`}
              >
                <td className="p-1.5 border-b border-r border-[#E2E8F0] text-[11px]">{startIndex + index + 1}</td>
                {[
                  "name",
                  "organization",
                  "addressLine1",
                  "addressLine2",
                  "city",
                  "state",
                  "country",
                  "zipcode",
                  "phoneNumber",
                  "regCode",
                  "agentAttorney",
                  "dateOfPatent",
                  "agentLicensed",
                  "firmOrOrganization",
                  "updatedPhoneNumber",
                  "emailAddress",
                  "updatedOrganization",
                  "firmUrl",
                  "updatedAddress",
                  "updatedCity",
                  "updatedState",
                  "updatedCountry",
                  "updatedZipcode",
                ].map((field, colIndex) => (
                  <td
                    key={field}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onBlur={(e) => handleEdit(user.regCode, field, e.target.textContent)}
                    onKeyDown={(e) => handleKeyDown(e, index, colIndex + 1)}
                    className="p-1.5 border-b border-r border-[#E2E8F0] focus:bg-[#E6F0FA] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50 text-[11px]"
                  >
                    {editedUsers[user.regCode]?.[field] || user[field] || ""}
                  </td>
                ))}
                <td
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onBlur={(e) => handleEdit(user.regCode, "linkedInProfile", e.target.textContent)}
                  onKeyDown={(e) => {
                    handleKeyDown(e, index, 24);
                    if (e.ctrlKey && e.key === "Enter") {
                      const url = editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile;
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="p-1.5 border-b border-r border-[#E2E8F0] focus:bg-[#E6F0FA] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50 text-[11px]"
                >
                  <a
                    href={editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile}
                    title="Double click to follow this link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile;
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="underline text-[#38BDF8] hover:text-[#2B9FE7]"
                  >
                    {editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile || "No LinkedIn Profile"}
                  </a>
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onBlur={(e) => handleEdit(user.regCode, "notes", e.target.textContent)}
                  onKeyDown={(e) => handleKeyDown(e, index, 25)}
                  className="p-1.5 border-b border-r border-[#E2E8F0] focus:bg-[#E6F0FA] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50 text-[11px]"
                >
                  {editedUsers[user.regCode]?.notes || user.notes || ""}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onBlur={(e) => handleEdit(user.regCode, "initials", e.target.textContent)}
                  onKeyDown={(e) => handleKeyDown(e, index, 26)}
                  className="p-1.5 border-b border-r border-[#E2E8F0] focus:bg-[#E6F0FA] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50 text-[11px]"
                >
                  {editedUsers[user.regCode]?.initials || user.initials || ""}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onBlur={(e) => handleEdit(user.regCode, "dataUpdatedAsOn", e.target.textContent)}
                  onKeyDown={(e) => handleKeyDown(e, index, 27)}
                  className="p-1.5 border-b border-r border-[#E2E8F0] focus:bg-[#E6F0FA] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50 text-[11px]"
                >
                  {editedUsers[user.regCode]?.dataUpdatedAsOn || user.dataUpdatedAsOn || ""}
                </td>
                <td className="p-1.5 border-b border-r border-[#E2E8F0] text-center">
                  <input
                    type="checkbox"
                    checked={user.isChecked || false}
                    onChange={(e) => handleCheckboxChange(user.regCode, e.target.checked)}
                  />
                </td>
                <td className="p-1.5 border-b border-[#E2E8F0] flex gap-1.5 justify-center">
                  <button
                    onClick={updating}
                    className="px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-semibold rounded hover:from-yellow-600 hover:to-yellow-700 active:scale-95 transition-all duration-200"
                  >
                    {loading ? "Edited" : "Edit"}
                  </button>
                  <button
                    onClick={handleUpdateAll}
                    className="px-2.5 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded hover:from-green-600 hover:to-green-700 active:scale-95 transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => toast.warn("Not Permitted", { position: "top-center" })}
                    className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs bg-white disabled:bg-[#E2E8F0] disabled:cursor-not-allowed hover:bg-[#38BDF8] hover:text-white transition-all duration-200"
        >
          Previous
        </button>
        <span className="flex items-center gap-1.5 text-xs text-[#1E293B]">
          Page
          <input
            type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyPress={handlePageInputKeyPress}
            onBlur={handlePageJump}
            className="w-14 p-1 border border-[#CBD5E1] rounded-lg text-center text-xs focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#60A5FA]/20"
            placeholder={currentPage}
            min="1"
            max={totalPages}
          />
          of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs bg-white disabled:bg-[#E2E8F0] disabled:cursor-not-allowed hover:bg-[#38BDF8] hover:text-white transition-all duration-200"
        >
          Next
        </button>
      </div>

      {/* Total Data */}
      <h4 className="text-xs text-[#1E293B] text-center">
        Total data for user {userId}: {filteredUsers.length}
      </h4>

      {/* Inline CSS */}
      <style>
        {`
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
};

export default LiveSheet;