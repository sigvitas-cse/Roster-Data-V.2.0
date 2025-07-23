import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineIdentification, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import axios from 'axios';
import { toast } from 'react-toastify';

function BigDataPage() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedFields, setDetectedFields] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const suggestionPanelRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = async (query = '', page = 1, field = '', limit = 20) => {
    try {
      const url = `${API_URL}/api/FullDataAccess?query=${encodeURIComponent(query)}${field ? `&field=${field}` : ''}&page=${page}&limit=${limit}`;
      const response = await axios.get(url, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      if (response.data.results && response.data.totalCount !== undefined) {
        setData(response.data.results);
        setTotalCount(response.data.totalCount);
        setCurrentPage(page);
        setError('');
      } else {
        setData([]);
        setTotalCount(0);
        setError(response.data.message || 'No data available.');
      }
    } catch (err) {
      console.error('❌ Fetch error:', {
        message: err.response ? err.response.data.message : err.message,
        status: err.response ? err.response.status : 'No response',
        query,
        field,
      });
      setError('Server error. Please try again.');
      setData([]);
      setTotalCount(0);
      if (err.response && err.response.status === 401) {
        toast.error('Authentication failed. Please log in again.', { position: 'top-center' });
        localStorage.removeItem('token');
        navigate('/explore', { replace: true });
      }
    }
  };

  // Initialize state from URL query parameters
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/explore', { replace: true });
      return;
    }

    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;

    setSearchQuery(query);
    setCurrentPage(page);
    if (query) {
      handleSearch({ preventDefault: () => {} }); // Trigger search with URL query
    } else {
      fetchData('', page); // Fetch all data for the page
    }
  }, [navigate, searchParams]);

  const updateURL = (query, page) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (page > 1) params.set('page', page);
    navigate(`/bigdata?${params.toString()}`, { replace: true });
  };

  const handleSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query', { position: 'top-center' });
      setData([]);
      setError('Please enter a search query.');
      setTotalCount(0);
      setSuggestions({});
      setIsInputFocused(false);
      if (inputRef.current) inputRef.current.blur();
      return;
    }
    const queries = searchQuery.split(',').map((q) => q.trim()).filter(Boolean);
    if (queries.length > 5) {
      toast.error('Multiple search allows up to 5 entries.', { position: 'top-center' });
      return;
    }
    try {
      const results = [];
      for (const query of queries) {
        if (query.length < 1) {
          toast.warn(`Query "${query}" is too short. Minimum 2 characters required.`, { position: 'top-center' });
          continue;
        }
        const field = detectedFields[0] || 'name'; // Default to 'name' if no field detected
        const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
          params: { query, field },
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (Array.isArray(response.data.results) && response.data.results.length > 0) {
          results.push(...response.data.results);
        }
        setTotalCount(response.data.total || 0);
      }
      setData(results);
      setError(results.length === 0 ? 'No matching profiles found.' : '');
      setSuggestions({});
      setIsInputFocused(false);
      if (inputRef.current) inputRef.current.blur();
      updateURL(searchQuery.trim(), 1); // Update URL after search
    } catch (err) {
      console.error('❌ Search error:', err.response ? err.response.data : err.message);
      toast.error('Server error occurred. Please try again.', { position: 'top-center' });
      setData([]);
      setTotalCount(0);
    }
  };

  const handleSuggestionSearch = async (term, field) => {
    try {
      const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
        params: { query: term, field },
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      if (Array.isArray(response.data.results) && response.data.results.length > 0) {
        setData(response.data.results);
        setError('');
      } else {
        setData([]);
        setError('No matching profiles found.');
      }
      setTotalCount(response.data.total || 0);
      setSearchQuery(term); // Update searchQuery to reflect selected suggestion
      setSuggestions({});
      setIsInputFocused(false);
      if (inputRef.current) inputRef.current.blur();
      updateURL(term, 1); // Update URL with selected suggestion
    } catch (err) {
      console.error('❌ Suggestion search error:', err);
      toast.error('Server error occurred.', { position: 'top-center' });
      setData([]);
      setTotalCount(0);
    }
  };

  let debounceTimer;
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSuggestions({});
    setDetectedFields([]);
    setActiveSuggestionIndex(-1);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const trimmed = value.trim();
      if (trimmed.length === 0) return;
      try {
        const cleanedValue = trimmed.replace(/[-.() ]/g, '');
        const isPhoneNumber = /^(\d{10}|\d{3}-\d{3}-\d{4})$/.test(cleanedValue);
        const isZipcode = /^(\d{9}|\d{5}-\d{4})$/.test(cleanedValue);
        if (/^\d+$/.test(cleanedValue) && cleanedValue.length > 6) {
          setDetectedFields(isPhoneNumber ? ['phoneNumber'] : isZipcode ? ['zipcode'] : ['zipcode', 'phoneNumber']);
          setSuggestions({});
          setIsInputFocused(false);
        } else {
          const res = await axios.get(`${API_URL}/api/suggestions`, {
            params: { query: trimmed },
            headers: { 'x-auth-token': localStorage.getItem('token') },
          });
          if (res.data?.fields?.length > 0) {
            setDetectedFields(res.data.fields);
            setSuggestions(res.data.suggestions);
          } else {
            setDetectedFields([]);
            setSuggestions({});
          }
        }
      } catch (err) {
        console.error('Suggestion error:', err.message);
      }
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isInputFocused && Object.keys(suggestions).length > 0 && activeSuggestionIndex >= 0) {
        e.preventDefault();
        const allSuggestions = detectedFields.flatMap(field => suggestions[field].slice(0, 5) || []);
        const selectedSuggestion = allSuggestions[activeSuggestionIndex];
        if (selectedSuggestion) {
          let currentField = '';
          let cumulativeIndex = 0;
          for (const field of detectedFields) {
            const fieldSuggestions = suggestions[field].slice(0, 5) || [];
            const nextIndex = cumulativeIndex + fieldSuggestions.length;
            if (activeSuggestionIndex >= cumulativeIndex && activeSuggestionIndex < nextIndex) {
              currentField = field;
              break;
            }
            cumulativeIndex = nextIndex;
          }
          setSearchQuery(selectedSuggestion);
          setSuggestions({});
          setDetectedFields([]);
          setActiveSuggestionIndex(-1);
          setIsInputFocused(false);
          handleSuggestionSearch(selectedSuggestion, currentField || detectedFields[0] || 'name');
        }
      } else {
        handleSearch(e);
      }
    } else if (isInputFocused && Object.keys(suggestions).length > 0) {
      const allSuggestions = detectedFields.flatMap(field => suggestions[field].slice(0, 5) || []);
      const totalDisplayed = Math.min(5 * detectedFields.length, allSuggestions.length);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => {
          const newIndex = (prev + 1) % totalDisplayed;
          if (suggestionPanelRef.current && newIndex > 4) {
            const itemHeight = suggestionPanelRef.current.querySelector('li')?.offsetHeight || 40;
            suggestionPanelRef.current.scrollTop = (newIndex - 4) * itemHeight;
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => {
          const newIndex = (prev - 1 + totalDisplayed) % totalDisplayed;
          if (suggestionPanelRef.current && newIndex >= 0) {
            const itemHeight = suggestionPanelRef.current.querySelector('li')?.offsetHeight || 32;
            suggestionPanelRef.current.scrollTop = newIndex * itemHeight;
          }
          return newIndex;
        });
      } else if (detectedFields.length > 1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const currentFieldIndex = detectedFields.findIndex((field, i) => {
          const fieldSuggestions = suggestions[field].slice(0, 5) || [];
          const globalStart = detectedFields.slice(0, i).flatMap(f => suggestions[f].slice(0, 5) || []).length;
          const globalEnd = globalStart + fieldSuggestions.length;
          return activeSuggestionIndex >= globalStart && activeSuggestionIndex < globalEnd;
        });
        const newFieldIndex = e.key === 'ArrowRight'
          ? (currentFieldIndex + 1) % detectedFields.length
          : (currentFieldIndex - 1 + detectedFields.length) % detectedFields.length;
        const newField = detectedFields[newFieldIndex];
        const fieldSuggestions = suggestions[newField].slice(0, 5) || [];
        setActiveSuggestionIndex(detectedFields.slice(0, newFieldIndex).flatMap(f => suggestions[f].slice(0, 5) || []).length);
      }
    }
  };

  const handleNext = () => {
    if (currentPage * 20 < totalCount) {
      const newPage = currentPage + 1;
      fetchData(searchQuery.trim(), newPage, detectedFields[0] || '');
      setCurrentPage(newPage);
      updateURL(searchQuery.trim(), newPage);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      fetchData(searchQuery.trim(), newPage, detectedFields[0] || '');
      setCurrentPage(newPage);
      updateURL(searchQuery.trim(), newPage);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/guiestlogout`, {
      method: 'POST',
      headers: { 'x-auth-token': localStorage.getItem('token') },
    });
    localStorage.removeItem('token');
    navigate('/explore', { replace: true });
  };

  const copyToClipboard = (profile) => {
    const contactDetails = `Name: ${profile.name}\nOrganization: ${profile.organization}\nPhone: ${profile.phoneNumber}\nEmail: ${profile.emailAddress}\nAddress: ${profile.addressLine1}${profile.addressLine2 ? ', ' + profile.addressLine2 : ''}, ${profile.city}, ${profile.state}, ${profile.country}, ${profile.zipcode}\nReg No.: ${profile.regCode}`.trim();
    navigator.clipboard.writeText(contactDetails)
      .then(() => toast.success(`✔️ Contact info for "${profile.name}" copied!`, { position: 'top-center', autoClose: 2000, theme: 'light' }))
      .catch(() => toast.error('❌ Failed to copy contact details.', { position: 'top-center' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] font-['Inter',sans-serif]">
      <div className="w-full py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Triangle IP | Data Portal</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
            Logout
          </button>
        </div>
      </div>

      {/* Search Panel */}
      <div className="z-50 sticky top-[68px] w-full max-w-6xl mb-0 mx-auto flex justify-center bg-white p-6 sm:p-8 rounded-0 shadow-lg border border-[#38BDF8]/20 my-0">
        <form onSubmit={handleSearch} className="w-full max-w-2xl flex flex-col lg:flex-row gap-4 items-center">
          <div className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onPaste={(e) => {
                    e.preventDefault();
                    const pastedValue = e.clipboardData.getData('text').trim();
                    setSearchQuery(pastedValue);
                    setSuggestions({});
                    setIsInputFocused(false);
                    handleInputChange({ target: { value: pastedValue } });
                  }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder="Search by name, reg no., org, city, phone, etc. (e.g., Smith, 12345, 555-123-4567)"
              className="w-full px-4 py-3 pr-14 pl-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-sky-400 text-sm shadow-sm outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setData([]);
                  setTotalCount(0);
                  setError('');
                  setSuggestions({});
                  setDetectedFields([]);
                  updateURL('', 1); // Clear query and reset page in URL
                }}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg"
                title="Clear"
              >
                <HiOutlineX />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-sky-600 text-lg"
              title="Search"
            >
              <HiOutlineSearch />
            </button>
            {isInputFocused && Object.keys(suggestions).length > 0 && (
              <div
                ref={suggestionPanelRef}
                className="absolute top-full left-0 bg-white border border-gray-200 mt-1 z-50 rounded shadow text-sm max-h-48 overflow-y-auto scrollbar-w-0 w-full"
                style={{ scrollBehavior: 'smooth' }}
              >
                {detectedFields.length === 1 ? (
                  <ul className="py-2">
                    {suggestions[detectedFields[0]].slice(0, 5).map((s, i) => {
                      const globalIndex = i;
                      return (
                        <li
                          key={i}
                          onClick={() => {
                            setSearchQuery(s);
                            setSuggestions({});
                            setDetectedFields([]);
                            setActiveSuggestionIndex(-1);
                            setIsInputFocused(false);
                            handleSuggestionSearch(s, detectedFields[0]);
                          }}
                          className={`px-4 py-2 hover:bg-sky-100 cursor-pointer ${activeSuggestionIndex === globalIndex ? 'bg-sky-200' : ''}`}
                        >
                          {s}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {detectedFields.slice(0, 3).map((field) => {
                      const fieldIndex = detectedFields.indexOf(field);
                      return (
                        <div key={field} className="flex flex-col">
                          <h4 className="font-semibold text-gray-700 capitalize mb-2">
                            {field === 'regCode' ? 'Reg No.' : 
                             field === 'phoneNumber' ? 'Phone' : 
                             field === 'addressLine1' ? 'Address' : 
                             field === 'agentAttorney' ? 'Agent/Attorney' : 
                             field}
                          </h4>
                          <ul className="space-y-1">
                            {suggestions[field].slice(0, 5).map((s, i) => {
                              const globalIndex = detectedFields.slice(0, fieldIndex)
                                .flatMap(f => suggestions[f].slice(0, 5) || [])
                                .length + i;
                              return (
                                <li
                                  key={i}
                                  onClick={() => {
                                    setSearchQuery(s);
                                    setSuggestions({});
                                    setDetectedFields([]);
                                    setActiveSuggestionIndex(-1);
                                    setIsInputFocused(false);
                                    handleSuggestionSearch(s, field);
                                  }}
                                  className={`px-2 py-1 hover:bg-sky-100 cursor-pointer rounded ${activeSuggestionIndex === globalIndex ? 'bg-sky-200' : ''}`}
                                >
                                  {s}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          {detectedFields.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {detectedFields.slice(0, 3).map(field => 
                field === 'regCode' ? 'Reg No.' : 
                field === 'phoneNumber' ? 'Phone' : 
                field === 'addressLine1' ? 'Address' : 
                field === 'agentAttorney' ? 'Agent/Attorney' : 
                field
              ).join(', ')}
            </p>
          )}
        </form>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 border border-gray-100 bg-white">
        <p className="text-sm font-medium mb-4">Total Records: {totalCount}</p>
        {error && <p className="bg-red-100 border-l-4 border-red-400 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}

        <div className="bg-white shadow-sm border border-gray-100 p-4 rounded-xl mb-6 flex flex-wrap justify-between items-center text-sm text-slate-700">
          <span>
            🔍 <strong>{totalCount}</strong> matches found and <strong>{data.length}</strong> results displaying
            {data.length > 20 && ' (more matches may be available, contact support)'}
          </span>
          <span>
            📅 Updated weekly • Last sync:{' '}
            <strong>
              {(() => {
                const now = new Date();
                const lastTuesday = new Date(now.setDate(now.getDate() - ((now.getDay() + 5) % 7)));
                lastTuesday.setHours(0, 0, 0, 0);
                return lastTuesday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
              })()}
            </strong>{' '}
            (or check for the most recent update)
          </span>
        </div>

        <div className="mb-6">
          <h4 className="text-sm text-slate-600 font-semibold mb-2">Popular Queries</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { term: 'Attorney', field: 'agentAttorney' },
              { term: 'Agent', field: 'agentAttorney' },
              { term: 'Chicago', field: 'city' },
              { term: 'New York', field: 'city' },
              { term: 'Columbia Law', field: 'organization' }
            ].map(({ term, field }) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  setDetectedFields([field]);
                  setSuggestions({});
                  setIsInputFocused(false);
                  handleSuggestionSearch(term, field);
                }}
                className="bg-sky-50 text-sky-700 text-xs px-3 py-1 rounded-full hover:bg-sky-100 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.map((profile, index) => (
            <div key={index} className="relative group bg-white rounded-0 border border-[#38BDF8]/20 shadow-md hover:shadow-2xl transition-transform duration-300 ease-in-out h-[360px] overflow-hidden flex flex-col before:absolute before:inset-0 before:bg-[#38BDF8] before:h-2 before:top-0 before:z-0 group-hover:before:h-full before:transition-all before:duration-300">
              <div className="relative z-10 flex flex-col h-full">
                <div className="h-1/2 group-hover:h-[45%] transition-all duration-300 flex justify-center items-center bg-sky-700 hover:bg-sky-950">
                  <svg className="w-28 h-28 text-[#38BDF8] p-3 bg-[#E0F2FE] rounded-full shadow" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C9.24 2 7 4.24 7 7c0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.76-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0 2c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4zm0 6H8v-2c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2h-4z" />
                  </svg>
                </div>
                <div className="h-1/2 group-hover:h-[50%] transition-all duration-300 px-4 pt-2 overflow-hidden text-left">
                  <div className="space-y-[6px] text-[14px] text-slate-800 leading-tight">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{profile.name}</h3>
                    {profile.agentAttorney && (
                      <p className="text-sky-600 italic font-medium text-[13px]">{profile.agentAttorney}</p>
                    )}
                    <p className="flex items-center gap-2">
                      <HiOutlineOfficeBuilding className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700 truncate">{profile.organization}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlineIdentification className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700">{profile.regCode}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlinePhone className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700">{profile.phoneNumber}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlineMail className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700 truncate">{profile.emailAddress}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-0 group-hover:h-[20%] transition-all duration-300 px-4 bg-sky-950 text-white text-sm flex justify-between items-center opacity-0 group-hover:opacity-100">
                <button onClick={() => copyToClipboard(profile)} className="hover:underline">📋 Copy Contact</button>
                <button
                  onClick={() => navigate(`/profile/${profile._id}`)}
                  className="text-lg hover:scale-110 transition"
                  title="More Info"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
            aria-label="Previous page"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Dynamic Page Number Buttons */}
          {Array.from({ length: Math.ceil(totalCount / 20) }, (_, i) => i + 1).slice(
            Math.max(0, currentPage - 3),
            Math.min(Math.ceil(totalCount / 20), currentPage + 2)
          ).map((page) => (
            <button
              key={page}
              onClick={() => {
                fetchData(searchQuery.trim(), page, detectedFields[0] || '');
                setCurrentPage(page);
                updateURL(searchQuery.trim(), page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${page === currentPage
                ? 'bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } font-semibold text-sm transition-all duration-200 ease-in-out shadow-md hover:shadow-lg`}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage * 20 >= totalCount}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
            aria-label="Next page"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BigDataPage;