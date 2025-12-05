import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import ErrorModal from '../components/Home/ErrorModel'; // Adjust the import path as necessary

// Helper: same logic as before, just a plain function (NO hooks)
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
  }, [id, API_URL]); // same effect, just added API_URL for cleanliness

  if (error) {
    return <ErrorModal error={error} onClose={() => navigate(-1)} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#E0F2FE] to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-600">Loading profile details...</p>
        </div>
      </div>
    );
  }

  // Define fields for Updated Data
  const updatedFieldKeys = [
    'name',
    'highTechQualification',
    'regCode',
    'agentAttorney',
    'dateOfPatent',
    'agentLicensed',
    'firmOrOrganization',
    'updatedPhoneNumber',
    'emailAddress',
    'updatedOrganization',
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

  // Define fields for Original Data
  const originalFieldKeys = [
    'name',
    'firmOrOrganization',
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'country',
    'zipcode',
    'phoneNumber',
    'regCode',
    'agentAttorney',
  ];
  const originalFields = Object.entries(profile).filter(
    ([key, value]) =>
      originalFieldKeys.includes(key) &&
      value &&
      typeof value === 'string' &&
      value !== '0'
  );

  const lastUpdatedLabel = getLastUpdatedLabel();

  return (
    <div className="min-h-screen bg-slate-50/80 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top bar: back button + title */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-sky-700 hover:text-sky-900"
          >
            <span className="mr-1">←</span> Back to Results
          </button>
          <span className="text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-700 font-medium">
            Profile Overview
          </span>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-slate-100 overflow-hidden">
          {/* Hero / Header Section */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 sm:px-10 py-7 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 flex items-center justify-center shadow-lg ring-2 ring-white/40">
                  <span className="text-3xl font-semibold">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
                  </span>
                </div>
                {profile.regCode && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-sky-900/80">
                    Reg: {profile.regCode}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {profile.name || 'Unknown Name'}
                </h1>
                <p className="mt-1 text-sm text-sky-100">
                  {profile.agentAttorney || 'Attorney / Agent'}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
                  {profile.organization && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                      <HiOutlineOfficeBuilding className="text-sky-100" />
                      <span>{profile.organization}</span>
                    </div>
                  )}
                  {profile.city && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                      <HiOutlineLocationMarker className="text-sky-100" />
                      <span>
                        {profile.city}
                        {profile.state ? `, ${profile.state}` : ''}
                        {profile.country ? `, ${profile.country}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Summary card */}
            <section className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-sm text-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-sky-900">Summary</h2>
                <span className="text-[11px] text-sky-700 bg-white/70 px-2.5 py-0.5 rounded-full border border-sky-100">
                  Auto-generated
                </span>
              </div>
              <p className="leading-relaxed">
                {profile.name || 'This professional'} is affiliated with{' '}
                {profile.organization || 'N/A'} and located in{' '}
                {[profile.city, profile.state, profile.country]
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
                . Their registration ID is {profile.regCode || 'N/A'}. Additional firm
                and contact information is listed below.
              </p>
            </section>

            {/* Biography / Notes */}
            {(profile.biography || profile.notes) && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.biography && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h2 className="text-sm font-semibold text-slate-800 mb-2">
                      Biography
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {profile.biography}
                    </p>
                  </div>
                )}
                {profile.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <h2 className="text-sm font-semibold text-amber-800 mb-2">
                      Internal Notes
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-900 leading-relaxed whitespace-pre-line">
                      {profile.notes}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Contact Info */}
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">
                Contact & Online Presence
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
                {profile.emailAddress && (
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <HiOutlineMail className="mt-0.5 text-sky-600" />
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
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <HiOutlinePhone className="mt-0.5 text-sky-600" />
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
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <HiOutlineGlobe className="mt-0.5 text-sky-600" />
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
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <svg
                      className="mt-0.5 w-4 h-4 text-sky-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.98 3.5c0 1.38-1.1 2.5-2.48 2.5C1.11 6 0 4.88 0 3.5 0 2.12 1.11 1 2.5 1S5 2.12 5 3.5zM0 24h5V7H0v17zM7.8 7h4.8v2.4h.1c.7-1.3 2.4-2.7 4.9-2.7 5.3 0 6.3 3.5 6.3 8v9.3h-5V16c0-2.2 0-5-3-5s-3.5 2.3-3.5 4.8V24H7.8V7z" />
                    </svg>
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
              </div>
            </section>

            {/* Details Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Profile Details
                </h2>
              </div>

              {/* Updated Data */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-sky-800 uppercase tracking-wide">
                    Updated Data
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Data updated as on {lastUpdatedLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {updatedFields.length === 0 && (
                    <p className="text-slate-500 italic col-span-full">
                      No updated data available.
                    </p>
                  )}
                  {updatedFields.map(([key, value], i) => (
                    <div
                      key={`updated-${i}`}
                      className="bg-sky-50 border border-sky-100 p-3 rounded-lg"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-sky-700 mb-0.5">
                        {key === 'regCode'
                          ? 'Registration Number'
                          : key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-slate-900 break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Original Data */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                    Original Data
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {originalFields.length === 0 && (
                    <p className="text-slate-500 italic col-span-full">
                      No original data available.
                    </p>
                  )}
                  {originalFields.map(([key, value], i) => (
                    <div
                      key={`original-${i}`}
                      className="bg-slate-50 border border-slate-100 p-3 rounded-lg"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-slate-600 mb-0.5">
                        {key === 'regCode'
                          ? 'Registration Number'
                          : key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-slate-900 break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Map */}
            {profile.city && profile.state && (
              <section className="mt-4">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">
                  Office Location
                </h2>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
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

            {/* Bottom Back Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-2 text-sm rounded-full shadow-sm hover:bg-sky-700 active:scale-[0.98] transition"
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
