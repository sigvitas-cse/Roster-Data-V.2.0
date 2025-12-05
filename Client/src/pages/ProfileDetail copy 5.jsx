import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import ErrorModal from '../components/Home/ErrorModel'; // Adjust path if needed

// Helper: "Data Updated As On" (same logic, just moved out)
function getLastUpdatedLabel() {
  const now = new Date('2025-10-21T16:21:00+05:30'); // 04:21 PM IST, Oct 21, 2025
  const lastTuesday = new Date(
    now.setDate(now.getDate() - ((now.getDay() + 5) % 7))
  );
  lastTuesday.setHours(0, 0, 0, 0);
  return lastTuesday.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [showDataGrowth, setShowDataGrowth] = useState(false); // New state

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/api/profile/${id}`);
        const data = await res.json();
        if (res.ok) {
          console.log('Profile data:', data);
          setProfile(data);
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('Server error');
      }
    }

    fetchProfile();
  }, [id, API_URL]);

  if (error) {
    return <ErrorModal error={error} onClose={() => navigate(-1)} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-600">Loading profile details...</p>
        </div>
      </div>
    );
  }

  // Updated data fields (same keys)
  const updatedFieldKeys = [
    'name',
    'highTechQualification',
    'regCode',
    'agentAttorney',
    'dateOfPatent',
    'agentLicensed',
    'updatedPhoneNumber',
    'emailAddress',
    'firmOrOrganization',
    'firmUrl',
    'updatedAddress',
    'updatedCity',
    'updatedState',
    'updatedCountry',
    'updatedZipcode',
    'linkedInProfile',
  ];
  const updatedFields = Object.entries(profile).filter(
    ([key, value]) =>
      updatedFieldKeys.includes(key) &&
      value &&
      typeof value === 'string' &&
      value !== '0'
  );

  const updatedProfile = {
  ...profile,
  address: `${profile.addressLine1 || ""}${profile.addressLine2 ? ", " + profile.addressLine2 : ""}`
};


  // Original data fields (same keys)
  const originalFieldKeys = [
    'name',
    'organization',
    // 'addressLine1',
    // 'addressLine2',
    'address',
    'city',
    'state',
    'country',
    'zipcode',
    'phoneNumber',
    'regCode',
    'agentAttorney',
  ];
  const originalFields = Object.entries(updatedProfile)
  .filter(
    ([key, value]) =>
      originalFieldKeys.includes(key) &&
      value &&
      typeof value === 'string' &&
      value !== '0'
  )
  .sort(([a], [b]) => originalFieldKeys.indexOf(a) - originalFieldKeys.indexOf(b));

 // Helper: Combine Address Line 1 + 2 intelligently
const getFullAddress = () => {
  const line1 = profile.addressLine1?.trim();
  const line2 = profile.addressLine2?.trim();
  console.log("addressLine1:",line1);
  console.log("addressLine2:",line2);

  if (!line1 && !line2) return '—';
  if (!line1) return line2;
  if (!line2) return line1;
  return `${line1}, ${line2}`;
};

// Helper: Format license dates properly (your real format: "02-09-2004 11-18-2005")
const formatLicenseDate = (dateStr) => {
  if (!dateStr || dateStr === '0' || dateStr === 'NA' || !dateStr.trim()) return '—';

  const dates = dateStr.trim().split(/\s+/);
  return dates
    .map(date => {
      const [mm, dd, yyyy] = date.split('-');
      if (!mm || !dd || !yyyy) return date;
      const fullYear = yyyy.length === 2 ? '20' + yyyy : yyyy;
      const dateObj = new Date(`${fullYear}-${mm}-${dd}`);
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    })
    .join(' → ');
};

  // Define fields for Overview Table (Original Data)
  const overviewFields = [
    { label: 'Name', key: 'name' },
    { label: 'Education', key: 'highTechQualification' },
    { label: 'Firm Or Organization Name', key: 'organization' },
    { label: 'Address', value: getFullAddress() }, // ← Smart merged address
    { label: 'City', key: 'city' },
    { label: 'State', key: 'state' },
    { label: 'Country', key: 'country' },
    { label: 'Zipcode', key: 'zipcode' },
    { label: 'Phone Number', key: 'phoneNumber' },
    { label: 'Registration Number', key: 'regCode' },
    { label: 'Agent/Attorney', key: 'agentAttorney' },
    { label: 'Date of Patent Agent Licensed', value: formatLicenseDate(profile.dateOfPatent) },
    { label: 'Date of Patent Attorney Licensed', value: formatLicenseDate(profile.agentLicensed) },
    { label: 'Firm Or Organization', key: 'firmOrOrganization' },
    { label: 'Firm Or Organization URL', key: 'firmUrl' },
    { label: 'LinkedIn Profile URL', key: 'linkedInProfile' },
  ];

  const lastUpdatedLabel = getLastUpdatedLabel();
  const displayOrganization = profile.organization || profile.firmOrOrganization;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-sky-700 hover:text-sky-900"
          >
            <span className="mr-0.5">←</span> Back to Results
          </button>
          <span className="text-[11px] sm:text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-medium border border-sky-200">
            Profile Detail View
          </span>
        </div>

        {/* Main card */}
        <div className="bg-white/90 backdrop-blur border border-slate-100 shadow-2xl shadow-sky-100 rounded-2xl overflow-hidden">
          {/* Header / hero */}
          <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-500 px-6 sm:px-10 py-7">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  <span className="text-3xl font-semibold text-white">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
                  </span>
                </div>
                {profile.regCode && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-sky-50 border border-white/30">
                    Reg: {profile.regCode}
                  </span>
                )}
              </div>

              {/* Name / meta */}
              <div className="flex-1 text-white">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {profile.name || 'Unnamed Professional'}
                  </h1>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 border border-white/30">
                    {profile.agentAttorney || 'Attorney / Agent'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-sky-100">
                  {displayOrganization && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
                      <HiOutlineOfficeBuilding className="text-sky-100" />
                      {displayOrganization}
                    </span>
                  )}
                  {(profile.city || profile.state || profile.country) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
                      <HiOutlineLocationMarker className="text-sky-100" />
                      {[profile.city, profile.state, profile.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Last updated pill */}
              <div className="self-stretch sm:self-auto flex sm:block items-center">
                <div className="ml-auto sm:ml-0 px-3 py-2 rounded-xl bg-sky-900/40 border border-white/30 text-[11px] text-sky-50">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-semibold tracking-wide">Updated</span>
                  </div>
                  <div className="opacity-90">{lastUpdatedLabel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Top grid: Summary + Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary */}
              <section className="lg:col-span-2 bg-sky-50 border border-sky-100 rounded-xl px-4 py-4 sm:px-5 sm:py-5 text-sm text-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-sky-900 text-sm sm:text-base">
                    Summary
                  </h2>
                  <span className="text-[11px] text-sky-700 bg-white/70 px-2.5 py-0.5 rounded-full border border-sky-100">
                    Auto-generated
                  </span>
                </div>
                <p className="leading-relaxed">
                  {profile.name || 'This professional'} is affiliated with{' '}
                  {displayOrganization || 'N/A'} and located in{' '}
                  {[profile.city, profile.state, profile.country]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                  . Their registration ID is {profile.regCode || 'N/A'}. Additional
                  firm, contact, and address details are available below.
                </p>
              </section>

              {/* Contact & online presence */}
              <section className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 text-xs sm:text-sm">
                <h2 className="text-sm font-semibold text-slate-800 mb-1">
                  Contact & Online Presence
                </h2>
                <div className="space-y-2.5">
                  {profile.emailAddress && (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 rounded-full bg-sky-100">
                        <HiOutlineMail className="text-sky-700 text-sm" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Email
                        </p>
                        <a
                          href={`mailto:${profile.emailAddress}`}
                          className="text-sky-700 hover:underline break-all"
                        >
                          {profile.emailAddress}
                        </a>
                      </div>
                    </div>
                  )}
                  {profile.phoneNumber && (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 rounded-full bg-sky-100">
                        <HiOutlinePhone className="text-sky-700 text-sm" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Phone
                        </p>
                        <a
                          href={`tel:${profile.phoneNumber}`}
                          className="text-sky-700 hover:underline break-all"
                        >
                          {profile.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                  {profile.firmUrl && (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 rounded-full bg-sky-100">
                        <HiOutlineGlobe className="text-sky-700 text-sm" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Firm Website
                        </p>
                        <a
                          href={
                            profile.firmUrl.startsWith('http')
                              ? profile.firmUrl
                              : `https://${profile.firmUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-700 hover:underline break-all"
                        >
                          {profile.firmUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {profile.linkedInProfile && (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 rounded-full bg-sky-100">
                        <svg
                          className="w-3.5 h-3.5 text-sky-700"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4.98 3.5c0 1.38-1.1 2.5-2.48 2.5C1.11 6 0 4.88 0 3.5 0 2.12 1.11 1 2.5 1S5 2.12 5 3.5zM0 24h5V7H0v17zM7.8 7h4.8v2.4h.1c.7-1.3 2.4-2.7 4.9-2.7 5.3 0 6.3 3.5 6.3 8v9.3h-5V16c0-2.2 0-5-3-5s-3.5 2.3-3.5 4.8V24H7.8V7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          LinkedIn
                        </p>
                        <a
                          href={profile.linkedInProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-700 hover:underline break-all"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                  {!profile.emailAddress &&
                    !profile.phoneNumber &&
                    !profile.firmUrl &&
                    !profile.linkedInProfile && (
                      <p className="text-[11px] text-slate-500 italic">
                        No contact details available.
                      </p>
                    )}
                </div>
              </section>
            </div>

            {/* Notes */}
            {profile.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-semibold text-amber-900 mb-2">Internal Notes</h3>
                <p className="text-amber-800 whitespace-pre-line">{profile.notes}</p>
              </div>
            )}

            {/* NEW: Overview Table (Original Data) */}
            {/* Profile Overview Table – FULLY FIXED */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Profile Overview</h2>
                <p className="text-xs text-slate-600">Original data from primary source</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-200">
                    {overviewFields.map((field, index) => {
                      const rawValue = field.value !== undefined ? field.value : profile[field.key];
                      const displayValue = (rawValue && rawValue !== '0' && rawValue !== 'NA') ? rawValue : '—';
                      const isUrlField = field.key === 'firmUrl' || field.key === 'linkedInProfile';

                      return (
                        <tr key={index} className="hover:bg-slate-100 transition-colors">
                          <td className="py-4 pl-6 pr-4 font-medium text-slate-800 w-80">
                            {field.label}
                          </td>
                          <td className="py-4 pr-6 text-slate-900">
                            {isUrlField && rawValue && rawValue !== '0' && rawValue !== 'NA' ? (
                              <a
                                href={field.key === 'firmUrl' 
                                  ? (rawValue.startsWith('http') ? rawValue : `https://${rawValue}`)
                                  : rawValue}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 hover:underline break-all"
                              >
                                {rawValue}
                              </a>
                            ) : (
                              <span className={displayValue === '—' ? 'text-slate-400 italic' : ''}>
                                {displayValue}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Toggle Button for Data Growth */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowDataGrowth(!showDataGrowth)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white font-medium text-sm rounded-full shadow-lg hover:from-sky-700 hover:to-sky-800 transition-all active:scale-95"
              >
                <span>{showDataGrowth ? 'Hide' : 'Show'} Data Growth</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showDataGrowth ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            
            {/* Conditional: Updated vs Original Data Comparison */}
            {/* Updated vs Original data */}
            {showDataGrowth && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Data Snapshot
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                

                {/* Original Data */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                        Original Data
                      </h3>
                      <p className="text-[11px] text-slate-600/90">
                        Data from initial source
                      </p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Reference
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm max-h-80 overflow-auto pr-1">
                    {originalFields.length === 0 && (
                      <p className="text-slate-500 italic col-span-full">
                        No original data available.
                      </p>
                    )}
                    {originalFields.map(([key, value], i) => (
                      <div
                        key={`original-${i}`}
                        className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-slate-600 mb-0.5">
                          {key === 'regCode'
                            ? 'Registration Number'
                            : key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-slate-900 break-words">
                          {key === "address" ? getFullAddress() : value}
                        </p>
                        {/* <p className="text-slate-900 break-words">{value}</p> */}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Updated Data */}
                <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Updated Data
                      </h3>
                      <p className="text-[11px] text-sky-700/80">
                        Latest validated information
                      </p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Live
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm max-h-80 overflow-auto pr-1">
                    {updatedFields.length === 0 && (
                      <p className="text-slate-500 italic col-span-full">
                        No updated data available.
                      </p>
                    )}
                    {updatedFields.map(([key, value], i) => (
                      <div
                        key={`updated-${i}`}
                        className="bg-white border border-sky-100/70 p-3 rounded-xl shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-sky-700 mb-0.5">
                          {/* {key === 'regCode' ? 'Registration Number' : key.replace(/([A-Z])/g, ' $1').trim()} */}
                          {
                            key === 'regCode'
                            ? 'Registration Number'
                            : key === 'dateOfPatent'
                            ? 'Date Of Patent Agent Licensed'
                            : key === 'agentLicensed'
                            ? 'Date Of Patent Attorney Licensed'
                            : key.replace(/([A-Z])/g, ' $1').trim()
                          }

                        </p>
                        <p className="text-slate-900 break-words">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>
            )}

            {/* Map */}
            {profile.city && profile.state && (
              <section className="mt-2">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">
                  Office Location
                </h2>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow">
                  <iframe
                    className="w-full h-64"
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${profile.city}, ${profile.state}`
                    )}&output=embed`}
                    title="Google Map"
                  ></iframe>
                </div>
              </section>
            )}

            {/* Bottom back button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-2 text-sm rounded-full shadow-md hover:bg-sky-700 active:scale-[0.98] transition-transform"
              >
                ← Back to Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetail;
