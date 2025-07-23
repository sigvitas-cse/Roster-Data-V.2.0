import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ErrorBoundary from "./ErrorBoundary";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import NewProfilesUpdated from "./IndivisualComponents/newProfiles";
import RemovedProfiles from "./IndivisualComponents/removedProfiles";
import NewProfilesUpdated2 from "./IndivisualComponents/updatedProfiles";
import { useLocation, useNavigate } from "react-router-dom";
import AdminInsights from "./IndivisualComponents/note";
import InsightsData from "./IndivisualComponents/insights";




const AttorneyRoster = () => {
  const [allData, setAllData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [totalRecords, setTotalRecords] = useState(0);
  const [apiPage, setApiPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState("");
  const [filters, setFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [searchField, setSearchField] = useState("name");
  const [activeView, setActiveView] = useState("allData"); // New state to manage active view

  const headerMap = {
    "S. No.": "slNo",
    Name: "name",
    Organization: "organization",
    "Address Line 1": "addressLine1",
    "Address Line 2": "addressLine2",
    City: "city",
    State: "state",
    Country: "country",
    Zipcode: "zipcode",
    "Phone Number": "phoneNumber",
    "Reg No.": "regCode",
    Attorney: "agentAttorney",
    "Date of Patent": "dateOfPatent",
    "Agent Licensed": "agentLicensed",
    "Firm or Organization": "firmOrOrganization",
    "Updated Phone Number": "updatedPhoneNumber",
    "Email Address": "emailAddress",
    "Updated Organization/Law Firm Name": "updatedOrganization",
    "Firm/Organization URL": "firmUrl",
    "Updated Address": "updatedAddress",
    "Updated City": "updatedCity",
    "Updated State": "updatedState",
    "Updated Country": "updatedCountry",
    "Updated Zipcode": "updatedZipcode",
    "LinkedIn Profile URL": "linkedInProfile",
    Notes: "notes",
    Initials: "initials",
    "Data Updated as on": "dataUpdatedAsOn",
  };

  const searchableFields = [
    { key: "name", label: "Name" },
    { key: "organization", label: "Organization" },
    { key: "city", label: "City" },
    { key: "regCode", label: "Registration Number" },
  ];

  const handleFilterChange = (columnHeader) => {
    const columnKey = headerMap[columnHeader];
    if (!columnKey) return;

    if (filters[columnKey]) {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters };
        delete newFilters[columnKey];
        return newFilters;
      });
      setActiveFilters((prevActiveFilters) => {
        const newActiveFilters = { ...prevActiveFilters };
        delete newActiveFilters[columnKey];
        return newActiveFilters;
      });
      return;
    }

    const value = prompt(`Filter by ${columnHeader}:`);
    if (value !== null) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [columnKey]: value.trim().toLowerCase(),
      }));
      setActiveFilters((prevActiveFilters) => ({
        ...prevActiveFilters,
        [columnKey]: true,
      }));
    }
  };

  const filteredData = useMemo(() => {
    return allData.filter((row) => {
      const matchesFilters = Object.entries(filters).every(([key, value]) =>
        row[key]?.toString().toLowerCase().includes(value)
      );
      const matchesGlobalSearch = globalSearch
        ? row[searchField]?.toString().toLowerCase().includes(globalSearch.toLowerCase())
        : true;
      return matchesFilters && matchesGlobalSearch;
    });
  }, [allData, filters, globalSearch, searchField]);

  const initialLimit = 5000;
  const batchLimit = 1000;
  const rowsPerPage = 500;
  
 const API_URL = import.meta.env.VITE_API_URL;



  const totalPages = totalRecords ? Math.ceil(totalRecords / rowsPerPage) : 1;

  const fetchAllData = async (pageNumber, limit, letter = "") => {
    try {
      const response = await axios.get(`${API_URL}/api/all-users-data`, {
        params: { page: pageNumber, limit, letter },
      });
      const updatedResponse = await axios.get(`${API_URL}/api/updatedprofilescomparisons`);

      if (response.status === 200 && updatedResponse.status === 200) {
        const updatedProfiles = new Set(
          updatedResponse.data.map((item) => item.regCode?.trim()?.toLowerCase())
        );

        setTotalRecords(response.data.totalUsers);

        setAllData((prevData) => {
          const existingIds = new Set(prevData.map((item) => item._id || item.regCode));
          const newData = response.data.data.filter((item) => !existingIds.has(item._id || item.regCode));

          const updatedAllData = [...prevData, ...newData].map((item) => {
            const isUpdated = updatedProfiles.has(item.regCode?.trim()?.toLowerCase());
            const changes = updatedResponse.data.find((changeItem) => changeItem.regCode === item.regCode)?.changes || {};
            return { ...item, isUpdated, changes };
          });

          return updatedAllData;
        });

        if (response.data.data.length < limit) {
          setHasMoreData(false);
        } else {
          setApiPage(pageNumber + 1);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setHasMoreData(false);
    }
  };

  useEffect(() => {
    fetchAllData(1, initialLimit);
  }, []);

  useEffect(() => {
    if (hasMoreData) {
      const interval = setInterval(() => {
        fetchAllData(apiPage, batchLimit, selectedLetter);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [hasMoreData, apiPage, selectedLetter]);

  const handleLetterClick = (letter) => {
    const selected = letter === "#" ? "" : letter;
    setSelectedLetter(selected);
    setCurrentPage(1);
    setApiPage(1);
    setAllData([]);
    setFilters({});
    setHasMoreData(true);
    fetchAllData(1, selected === "" ? 5000 : initialLimit, selected);
  };

  const visibleData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage]);

  const highlightMatch = (text, search) => {
    if (!text || !search) return text;
    const lowerText = text.toString().toLowerCase();
    const lowerSearch = search.toLowerCase();

    if (!lowerText.includes(lowerSearch)) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === lowerSearch ? (
        <span key={index} className="bg-yellow-200 font-medium">{part}</span>
      ) : (
        part
      )
    );
  };

  const handleAllDataClick = () => {
    setActiveView("allData");
    setSelectedLetter("");
    setCurrentPage(1);
    setApiPage(1);
    setAllData([]);
    setFilters({});
    setHasMoreData(true);
    fetchAllData(1, initialLimit);
  };

  const renderContent = () => {
    switch (activeView) {
      case "allData":
        return (
          <>
            {/* Alphabet Filter */}
            <div className="flex overflow-x-auto gap-0.5 p-1 mb-2 border-b border-[#CBD5E1]">
              {"#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                <button
                  key={letter}
                  className={`flex-1 px-1.5 py-0.5 text-[10px] font-medium text-[#1E293B] border-r border-[#CBD5E1] last:border-r-0 hover:bg-[#60A5FA] hover:text-white transition-all duration-150 ${
                    selectedLetter === letter ? "bg-[#60A5FA] text-white" : ""
                  }`}
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)] bg-white rounded-md">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white sticky top-0 z-10">
                  <tr>
                    {Object.keys(headerMap).map((header, index) => (
                      <th
                        key={index}
                        className="p-1 text-left text-[10px] font-semibold whitespace-nowrap"
                      >
                        {header}
                        {index !== 0 && (
                          activeFilters[headerMap[header]] ? (
                            <FaTimes
                              className="ml-0.5 text-red-500 cursor-pointer text-[8px]"
                              onClick={() => handleFilterChange(header)}
                              data-tooltip-id="filter-tooltip"
                              data-tooltip-content="Remove Filter"
                            />
                          ) : (
                            <FaFilter
                              className="ml-0.5 text-white cursor-pointer text-[8px]"
                              onClick={() => handleFilterChange(header)}
                              data-tooltip-id="filter-tooltip"
                              data-tooltip-content="Apply Filter"
                            />
                          )
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <Tooltip id="filter-tooltip" place="right" effect="solid" className="z-[1000] bg-gray-800 text-white p-0.5 text-[10px]" />
                <tbody>
                  {visibleData.map((data, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-[#F8FAFC] transition-colors duration-150 ${
                        data.isUpdated ? "bg-yellow-100 font-medium text-[#1E293B]" : ""
                      }`}
                      onClick={() => console.log("Row Clicked - regCode:", data.regCode, "isUpdated:", data.isUpdated)}
                    >
                      <td className="p-1 border-b border-[#CBD5E1] text-[10px] whitespace-normal">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      {Object.values(headerMap).slice(1).map((key, colIndex) => (
                        <td
                          key={colIndex}
                          data-tooltip-id="data-tooltip"
                          data-tooltip-content={
                            data.isUpdated
                              ? `Name: ${data.name}\nRegistration Number: ${data.regCode}\n` +
                                Object.keys(data.changes)
                                  .map((field) => {
                                    const change = data.changes[field];
                                    return `${field}:\nOld: ${change.oldValue}, New: ${change.newValue}`;
                                  })
                                  .join("\n")
                              : `Name: ${data.name}\nRegistration Number: ${data.regCode}\n${headerMap[key] || key}: ${data[key]}`
                          }
                          // overflow-hidden whitespace-nowrap text-ellipsis  thease will done by truncate
                          className={`p-1 border-b border-[#CBD5E1] text-[10px] whitespace-normal ${
                            key === "name" ? "max-w-[120px] whitespace-nowrap text-ellipsis" :
                            key === "organization" ? "max-w-[120px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "addressLine1" ? "max-w-[120px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "addressLine2" ? "max-w-[120px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "city" || key === "state" || key === "country" || key === "zipcode" ? "max-w-[80px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            
                            key === "updatedOrganization" ? "max-w-[120px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "updatedAddress" ? "max-w-[120px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "firmUrl" ? "max-w-[80px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "linkedInProfile" ? "max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "notes" ? "max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "initials" ? "max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis" :
                            key === "regCode" ? "max-w-[60px]" :
                            key === "updatedCity" || key === "updatedState" || key === "updatedCountry" || key === "phoneNumber" || key === "updatedPhoneNumber" || key === "emailAddress" ? "max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis" : ""
                          }`}
                        >
                          {key === "linkedInProfile" || key === "firmUrl" && data[key] ? (
                            <a
                              href={data[key]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#38BDF8] hover:underline text-[10px]"
                            >
                              {highlightMatch(data[key], globalSearch)}
                            </a>
                          ) : (
                            highlightMatch(data[key], globalSearch)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <Tooltip
                  id="data-tooltip"
                  place="left"
                  effect="solid"
                  className="z-[1000] bg-gray-800 text-white border border-[#38BDF8] p-0.5 text-[10px] whitespace-pre-line max-w-xs"
                />
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-2 gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-1.5 py-0.5 border border-[#38BDF8] bg-[#38BDF8] text-white rounded-md text-[10px] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed hover:bg-[#2B9FE7] transition-all duration-150"
              >
                {"<<"}
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-1.5 py-0.5 border border-[#38BDF8] bg-[#38BDF8] text-white rounded-md text-[10px] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed hover:bg-[#2B9FE7] transition-all duration-150"
              >
                {"<"}
              </button>
              <span className="flex items-center text-[10px] text-[#1E293B]">
                Page{" "}
                <input
                  className="w-8 mx-1 p-0.5 border border-[#CBD5E1] bg-white text-center text-[#1E293B] text-[10px] rounded-md focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                  type="number"
                  value={currentPage}
                  min="1"
                  max={totalPages}
                  onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const page = Number(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      } else {
                        toast.error(`Please enter a number between 1 and ${totalPages}`, { position: "top-center" });
                      }
                    }
                  }}
                />
                of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-1.5 py-0.5 border border-[#38BDF8] bg-[#38BDF8] text-white rounded-md text-[10px] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed hover:bg-[#2B9FE7] transition-all duration-150"
              >
                {">"}
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-1.5 py-0.5 border border-[#38BDF8] bg-[#38BDF8] text-white rounded-md text-[10px] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed hover:bg-[#2B9FE7] transition-all duration-150"
              >
                {">>"}
              </button>
            </div>
            <p className="text-center text-[#64748B] text-[10px] mt-1">
              {hasMoreData ? "Loading..." : "All data loaded."}
            </p>
          </>
        );
      case "newProfiles":
        return <NewProfilesUpdated />;
      case "removedProfiles":
        return <RemovedProfiles />; // Assume refactored similarly
      case "updatedProfiles":
        return <NewProfilesUpdated2 />; // Assume refactored similarly
      case "note":
        return <AdminInsights />;
      case "insights":
        return <InsightsData />; // Assume refactored similarly
      default:
        return null;
    }
  };

  return (
    <section className="p-2 bg-white rounded-md shadow-sm border border-[#CBD5E1] text-[#1E293B] max-h-[calc(100vh-180px)] overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-[#1E293B]">
          Patent Attorney Roster ({totalRecords}) | Page {currentPage}/{totalPages}
        </h2>
        <div className="flex items-center gap-1 flex-wrap">
          <div className="relative flex items-center bg-white border border-[#CBD5E1] rounded-md shadow-sm">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-16 h-6 px-1 py-0.5 border-r border-[#CBD5E1] rounded-l-md bg-white text-[10px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              data-tooltip-id="field-tooltip"
              data-tooltip-content="Select field to search"
            >
              {searchableFields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder={`Search ${searchField}...`}
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-24 flex-1 p-1 h-6 border-none rounded-r-md text-[10px] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
            />
            <FaSearch className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[#64748B] text-[10px]" />
          </div>
          <button
            className="text-[#22C55E] px-2 py-0.5 rounded-md text-[10px] font-medium hover:bg-[#22C55E] hover:text-white transition-all duration-150"
            onClick={handleAllDataClick}
          >
            All Data
          </button>
          <button
            className="text-[#38BDF8] px-2 py-0.5 rounded-md text-[10px] font-medium hover:bg-[#38BDF8] hover:text-white transition-all duration-150"
            onClick={() => setActiveView("newProfiles")}
          >
            New Profiles
          </button>
          <button
            className="text-[#EF4444] px-2 py-0.5 rounded-md text-[10px] font-medium hover:bg-[#EF4444] hover:text-white transition-all duration-150"
            onClick={() => setActiveView("removedProfiles")}
          >
            Removed
          </button>
          <button
            className="text-[#64748B] px-2 py-0.5 rounded-md text-[10px] font-medium hover:bg-[#64748B] hover:text-white transition-all duration-150"
            onClick={() => setActiveView("updatedProfiles")}
          >
            Updated
          </button>
          <button
            className="text-[#38BDF8] px-2 py-0.5 rounded-md text-[10px] font-medium hover:bg-[#38BDF8] hover:text-white transition-all duration-150"
            onClick={() => setActiveView("note")}
          >
            Note
          </button>
          <button
            className="text-[#8B5CF6] px-2 py-0.5 rounded-md text-[10px] font-medium hover:bg-[#8B5CF6] hover:text-white transition-all duration-150"
            onClick={() => setActiveView("insights")}
          >
            Insights
          </button>
          
        </div>
      </div>
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
    </section>
  );
};

export default AttorneyRoster;