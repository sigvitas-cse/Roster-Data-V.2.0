import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUniversity, FaCity, FaSync } from 'react-icons/fa';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { HiOutlinePhone, HiOutlineMail, HiOutlineIdentification, HiOutlineOfficeBuilding } from 'react-icons/hi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo1 from '../../assets/logos/logo1.png';
import logo2 from '../../assets/logos/logo2.png';
import logo3 from '../../assets/logos/logo3.png';
import logo4 from '../../assets/logos/logo4.png';
import patenillustration from '../../assets/Indivisuals/patent-illustration.png';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingProfiles, setMatchingProfiles] = useState([]);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [detectedFields, setDetectedFields] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [totalResults, setTotalResults] = useState(0);
  const suggestionPanelRef = useRef(null);
  const inputRef = useRef(null); // Added for programmatic focus control

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSearch = async (e) => {
    setSuggestions([]);
    setIsInputFocused(false); // Exit input focus after search
    if (inputRef.current) inputRef.current.blur(); // Programmatically blur the input
    if (e?.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query', { position: 'top-center' });
      setMatchingProfiles([]);
      setError('Please enter a search query.');
      setTotalResults(0);
      return;
    }
    const queries = searchQuery.split(',').map((q) => q.trim()).filter(Boolean);
    if (queries.length > 1) {
      if (!isLoggedIn) {
        toast.info('Login required for multiple searches', { position: 'top-center' });
        navigate('/MultipleSearchLogin');
        return;
      }
      if (queries.length > 5) {
        toast.error('Multiple search allows up to 5 entries.', { position: 'top-center' });
        return;
      }
    }
    try {
      const results = [];
      for (const query of queries) {
        if (query.length < 1) {
          toast.warn(`Query "${query}" is too short. Minimum 2 characters required.`, { position: 'top-center' });
          continue;
        }
        const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
          params: { query, field: detectedFields[0] || 'name' }
        });
        if (Array.isArray(response.data.results) && response.data.results.length > 0) {
          results.push(...response.data.results);
        }
        setTotalResults(response.data.total || 0); // Use total from response
      }
      setMatchingProfiles(results);
      setError(results.length === 0 ? 'No matching profiles found.' : '');
    } catch (err) {
      console.error('❌ Error fetching data:', err.response ? err.response.data : err.message);
      toast.error('Server error occurred. Please try again.', { position: 'top-center' });
      setMatchingProfiles([]);
      setTotalResults(0);
    }
  };

  const handleSuggestionSearch = async (term, field) => {
    try {
      const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
        params: { query: term, field }
      });
      if (Array.isArray(response.data.results) && response.data.results.length > 0) {
        setMatchingProfiles(response.data.results);
        setError('');
      } else {
        setMatchingProfiles([]);
        setError('No matching profiles found.');
      }
      setTotalResults(response.data.total || 0); // Use total from response
      setIsInputFocused(false); // Exit input focus after suggestion selection
      if (inputRef.current) inputRef.current.blur(); // Programmatically blur the input
    } catch (err) {
      console.error('❌ Error fetching data from suggestion:', err);
      toast.error('Server error occurred.', { position: 'top-center' });
      setMatchingProfiles([]);
      setTotalResults(0);
    }
  };

  const copyToClipboard = (profile) => {
    const contactDetails = `Name: ${profile.name}\nOrganization: ${profile.organization}\nPhone: ${profile.phoneNumber}\nEmail: ${profile.emailAddress}\nAddress: ${profile.addressLine1}${profile.addressLine2 ? ', ' + profile.addressLine2 : ''}, ${profile.city}, ${profile.state}, ${profile.country}, ${profile.zipcode}`.trim();
    navigator.clipboard.writeText(contactDetails)
      .then(() => {
        toast.success(`✔️ Contact info for "${profile.name}" copied!`, {
          position: 'top-center', autoClose: 2000, theme: 'light'
        });
      })
      .catch((err) => {
        toast.error('❌ Failed to copy contact details.', { position: 'top-center' });
      });
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
          const res = await axios.get(`${API_URL}/api/suggestions`, { params: { query: trimmed } });
          if (res.data?.fields?.length > 0) {
            setDetectedFields(res.data.fields);
            setSuggestions(res.data.suggestions);
          } else {
            setDetectedFields([]);
            setSuggestions({});
          }
        }
      } catch (err) {
        console.error('❌ Suggestion error:', err.message);
      }
    }, 300);
  };

  return (
    <div className="max-w-full w-full flex justify-center bg-white">
      <div className="max-w-7xl w-full h-full flex flex-col bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] font-['Inter',sans-serif] relative">
        {/* Background SVG Decoration */}
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720">
            <path
              fill="#38BDF8"
              d="M0,400L60,373.3C120,347,240,293,360,293.3C480,293,600,347,720,373.3C840,400,960,400,1080,386.7C1200,373,1320,347,1380,333.3L1440,320L1440,720L1380,720C1320,720,1200,720,1080,720C960,720,840,720,720,720C600,720,480,720,360,720C240,720,120,720,60,720L0,720Z"
            />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E2E8F0]/50" />
        </div>

        {/* Fixed Header */}
        <nav className="sticky top-0 z-10 px-6 sm:px-10 lg:px-20 py-4 text-sm text-gray-500 bg-white border-b border-gray-200">
          <ol className="flex items-center space-x-2 max-w-7xl mx-auto">
            <li><a href="/" className="text-sky-600 hover:underline">Home</a></li>
            <li>/</li>
            <li className="text-gray-700 font-medium">Explore</li>
          </ol>
        </nav>

        {/* Scrollable Main Content */}
        <main className="z-0 px-6 sm:px-10 lg:px-20 pb-24 pt-10">
          {/* Heading */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">Explore US Patent Attorney Data</h1>
            <p className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto">
              Dive into our up-to-date directory of attorneys. Use filters to narrow down your search.
            </p>
          </div>

          {/* 🔐 Always-Visible Prompt */}
          {!isLoggedIn && (
            <div className="text-sm text-center text-[#64748B] mb-6">
              Want to search multiple entries at once?{' '}
              <button
                onClick={() => navigate('/MultipleSearchLogin')}
                className="text-[#38BDF8] font-medium hover:underline"
              >
                Log in here
              </button>
              .
            </div>
          )}

          {/* Search Panel */}
          <div className="sticky top-10 min-w-full w-full z-50 flex justify-center bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-[#38BDF8]/20 mb-8">
            <form onSubmit={handleSearch} className="w-full max-w-4xl flex flex-col lg:flex-row gap-4 items-center">
              <div className="w-full lg:w-[100%] relative">
                <input
                  ref={inputRef} // Added ref for programmatic focus control
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
                  onKeyDown={(e) => {
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
                  }}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                  placeholder="Search by name, reg no., org, city, etc."
                  className="w-full px-4 py-3 pr-14 pl-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-sky-400 text-sm shadow-sm outline-none"
                />

                {/* Clear Icon (X) */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg"
                    title="Clear"
                  >
                    <HiOutlineX />
                  </button>
                )}

                {/* Search Icon */}
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
          <div className="bg-white/80 backdrop-blur-sm border border-sky-100 p-3 rounded-xl mb-6 text-xs text-slate-600 shadow-sm">
            💡 Tip: You can search by name, Registration Number, city, org, or email — even partial terms like “Smith” or “LLP”.
          </div>

          <div className="mb-6">
            <h4 className="text-sm text-slate-600 font-semibold mb-2">Popular Queries</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { term: 'Attorney', field: 'agentAttorney' },
                { term: 'Agent', field: 'agentAttorney' },
                { term: 'chicago', field: 'city' },
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

          {/* Error Message */}
          {error && <p className="text-red-500 font-semibold text-sm mb-4 text-center">{error}</p>}

          <div className="bg-white shadow-sm border border-gray-100 p-4 rounded-xl mb-6 flex flex-wrap justify-between items-center text-sm text-slate-700">
            <span>
              🔍 <strong>{totalResults}</strong> matches found and <strong>{matchingProfiles.length}</strong> results displaying
              {matchingProfiles.length > 20 && ' (more matches may be available, contact support)'}
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

          {/* Results Business Cards */}
          {matchingProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
              {matchingProfiles.map((profile, index) => (
                <div
                  key={index}
                  className="relative group bg-white rounded-0 border border-[#38BDF8]/20 shadow-md hover:shadow-2xl transition-transform duration-300 ease-in-out h-[360px] overflow-hidden flex flex-col before:absolute before:inset-0 before:bg-[#38BDF8] before:h-2 before:top-0 before:z-0 group-hover:before:h-full before:transition-all before:duration-300"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Profile Image Section */}
                    <div className="h-1/2 group-hover:h-[50%] transition-all duration-300 flex justify-center items-center bg-sky-700 hover:bg-sky-950">
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={`${profile.name}'s profile`}
                          className="w-40 h-40 rounded-full object-cover border-4 border-[#38BDF8]/40 shadow-md"
                        />
                      ) : (
                        <svg
                          className="w-28 h-28 text-[#38BDF8] p-3 bg-[#E0F2FE] rounded-full shadow"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C9.24 2 7 4.24 7 7c0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.76-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0 2c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4zm0 6H8v-2c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2h-4z"/>
                        </svg>
                      )}
                    </div>

                    {/* Contact Info Section */}
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

                  {/* Buttons Section (slide in) */}
                  <div className="h-0 group-hover:h-[20%] transition-all duration-300 px-4 bg-sky-950 text-white text-sm flex justify-between items-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => copyToClipboard(profile)}
                      className="hover:underline"
                    >
                      📋 Copy Contact
                    </button>
                    <button
                      onClick={() => toast.info('More info coming soon!', { position: 'top-center' })}
                      className="text-lg hover:scale-110 transition"
                      title="More Info"
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="mt-10 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className="text-[#38BDF8] text-sm font-medium hover:underline"
            >
              ← Back to Home
            </button>

            {isLoggedIn && (
              <button
                onClick={() => navigate('/bigdata')}
                className="text-[#0F172A] text-sm bg-[#E0F2FE] hover:bg-[#BAE6FD] px-4 py-2 rounded-lg font-medium"
              >
                Go to Big Data →
              </button>
            )}
          </div>

          {/* Additional Bottom Content Section */}
          <section className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 p-4 rounded-xl shadow mt-10 mb-10">
            <h4 className="text-sm text-emerald-800 font-bold mb-2">🧠 AI Suggests:</h4>
            <p className="text-xs text-slate-700">Users who searched for "<strong>Columbia Law</strong>" also searched for:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { term: 'New York', field: 'city' },
                { term: 'Harvard Law', field: 'organization' },
                { term: 'USPTO', field: 'organization' },
                { term: 'Agent', field: 'agentAttorney' }
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
                  className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full hover:bg-emerald-200 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow text-sm my-10">
            <h3 className="text-lg font-bold text-blue-800 mb-3">📘 Glossary</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Registration Number:</strong> Unique registration number assigned to a patent attorney/agent.</li>
              <li><strong>Organization:</strong> The law firm or IP entity the individual is affiliated with.</li>
              <li><strong>Agent vs Attorney:</strong> Attorneys are licensed to practice law; agents are certified by the USPTO to represent inventors.</li>
            </ul>
          </section>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-10">
            <div className="bg-white rounded-xl p-4 shadow border">
              <FaUsers className="mx-auto text-blue-600 text-2xl mb-1" />
              <p className="text-xl font-bold text-blue-700">32K+</p>
              <p className="text-xs text-gray-500">Attorneys</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow border">
              <FaUniversity className="mx-auto text-sky-600 text-2xl mb-1" />
              <p className="text-xl font-bold text-sky-700">1.4K+</p>
              <p className="text-xs text-gray-500">Organizations</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow border">
              <FaCity className="mx-auto text-emerald-600 text-2xl mb-1" />
              <p className="text-xl font-bold text-emerald-700">500+</p>
              <p className="text-xs text-gray-500">Cities</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow border">
              <FaSync className="mx-auto text-purple-600 text-2xl mb-1" />
              <p className="text-xl font-bold text-purple-700">Weekly</p>
              <p className="text-xs text-gray-500">Updates</p>
            </div>
          </div>

          <section className="bg-gradient-to-r from-sky-50 to-white border border-sky-100 p-4 rounded-xl shadow mt-10 mb-10 text-sm text-slate-700">
            📈 <strong>Trend:</strong> Most new registrations in the last 6 months are from California and New York.
          </section>

          <section className="mt-16 max-w-4xl mx-auto bg-white border border-gray-200 p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold text-center mb-4">🗣️ What Our Users Say</h3>
            <div className="space-y-4">
              <blockquote className="border-l-4 border-sky-500 pl-4 italic text-gray-600">
                "This platform has transformed the way I find patent attorneys. Highly recommend!" 
                <footer className="mt-2">— Jane Doe, Patent Researcher</footer>
              </blockquote>
              <blockquote className="border-l-4 border-sky-500 pl-4 italic text-gray-600">
                "The search functionality is intuitive and saves me a lot of time." 
                <footer className="mt-2">— John Smith, IP Analyst</footer>
              </blockquote>
            </div>
          </section>

          <section className="relative mt-20 border-t border-gray-200 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* How It Works */}
            <div className="bg-white rounded-xl p-6 shadow border border-sky-100">
              <h3 className="text-lg font-bold text-sky-700 mb-3">🔍 How It Works</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Choose a search field like Name or Reg No.</li>
                <li>• Enter a value or up to 5 comma-separated items</li>
                <li>• Single search for quick lookups</li>
                <li>• Multiple search requires login</li>
              </ul>
            </div>

            {/* Who Should Use This */}
            <div className="bg-white rounded-xl p-6 shadow border border-blue-100">
              <h3 className="text-lg font-bold text-blue-700 mb-3">👥 Who Should Use This?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Patent attorneys verifying registrations</li>
                <li>• IP research teams exploring law firm rosters</li>
                <li>• Legal data analysts studying trends</li>
                <li>• Organizations validating city or firm affiliations</li>
              </ul>
            </div>

            {/* Visual Illustration */}
            <div className="flex items-center justify-center">
              <img
                src={patenillustration}
                alt="Patent Illustration"
                className="w-full max-w-sm rounded-lg shadow-md"
              />
            </div>
          </section>

          {/* Call to Action: Big Data Access */}
          {!isLoggedIn && (
            <section className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl shadow text-center border border-sky-100">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Want to Unlock Big Data Insights?</h3>
              <p className="text-sm text-gray-600 mb-4">Log in to explore detailed attorney patterns, firm clusters, and smart filters designed for analysts.</p>
              <button
                onClick={() => navigate('/MultipleSearchLogin')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-sky-600 transition shadow"
              >
                Log in for Full Access
              </button>
            </section>
          )}

          <section className="mt-20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6 text-sky-900">❓ Frequently Asked Questions</h3>
            <div className="space-y-4">
              <details className="bg-white p-4 rounded-xl shadow border border-gray-200 cursor-pointer">
                <summary className="font-medium text-gray-800">What’s the difference between Single and Multiple search?</summary>
                <p className="text-sm mt-2 text-gray-600">Single search lets anyone look up one entry. Multiple search (up to 5) is available after login for bulk lookups.</p>
              </details>
              <details className="bg-white p-4 rounded-xl shadow border border-gray-200 cursor-pointer">
                <summary className="font-medium text-gray-800">Is this data official?</summary>
                <p className="text-sm mt-2 text-gray-600">The data is sourced from public patent records and updated regularly, but it's recommended to cross-verify for legal purposes.</p>
              </details>
              <details className="bg-white p-4 rounded-xl shadow border border-gray-200 cursor-pointer">
                <summary className="font-medium text-gray-800">How often is the directory updated?</summary>
                <p className="text-sm mt-2 text-gray-600">We sync new data weekly to ensure accuracy and completeness.</p>
              </details>
            </div>
          </section>

          <section className="mt-16 max-w-6xl mx-auto text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Trusted by research teams at:</h3>
            <div className="flex justify-center flex-wrap gap-8 items-center opacity-80">
              <img src={logo1} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 1" />
              <img src={logo2} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 2" />
              <img src={logo3} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 3" />
              <img src={logo4} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 4" />
            </div>
          </section>

          <div className="my-20">
            <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
              <path fill="#E0F2FE" fillOpacity="1" d="M0,64L80,58.7C160,53,320,43,480,42.7C640,43,800,53,960,69.3C1120,85,1280,107,1360,117.3L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
            </svg>
          </div>

          <section className="mt-20 max-w-3xl mx-auto bg-white border border-gray-200 p-6 rounded-xl shadow text-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">💬 Help us improve</h4>
            <p className="text-sm text-gray-600 mb-4">Have suggestions, feature requests, or found a bug?</p>
            <button
              onClick={() => window.open('https://forms.gle/your-form-id', '_blank')}
              className="text-sm bg-sky-100 text-sky-700 px-4 py-2 rounded hover:bg-sky-200 transition"
            >
              Give Feedback
            </button>
          </section>

          <section className="mt-20 max-w-md mx-auto bg-white shadow border border-gray-200 p-6 rounded-xl text-center">
            <h4 className="text-base font-semibold text-gray-800 mb-2">📬 Stay Updated</h4>
            <p className="text-sm text-gray-500 mb-4">Get monthly updates on attorney data improvements and new features.</p>
            <form className="flex flex-col sm:flex-row gap-2 items-center justify-center">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full sm:w-auto"
              />
              <button className="bg-sky-500 text-white px-4 py-2 text-sm rounded hover:bg-sky-600 transition">
                Subscribe
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Explore;