import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
  HiOutlineLocationMarker
} from 'react-icons/hi';

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
        if (res.ok) setProfile(data);
        else setError(data.message || 'Failed to fetch profile');
      } catch (err) {
        setError('Server error');
      }
    }

    fetchProfile();
  }, [id]);

  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;
  if (!profile) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] to-white p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl border border-gray-100 p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-28 h-28 bg-sky-100 rounded-full flex justify-center items-center shadow">
            <svg className="w-16 h-16 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3S10.35 4 12 4s3 1.35 3 3-1.35 3-3 3zm0 2c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-sky-600 italic text-sm">{profile.agentAttorney || 'Attorney / Agent'}</p>
            {profile.organization && (
              <p className="mt-1 flex items-center text-gray-600 text-sm">
                <HiOutlineOfficeBuilding className="mr-1" /> {profile.organization}
              </p>
            )}
            {profile.city && (
              <p className="flex items-center text-gray-600 text-sm">
                <HiOutlineLocationMarker className="mr-1" /> {profile.city}, {profile.state}, {profile.country}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-sky-50 border border-sky-100 p-4 rounded-md text-sm text-gray-800 leading-relaxed">
          <strong>Summary:</strong> <br />
          {profile.name} is affiliated with {profile.organization || 'N/A'} and located in {profile.city}, {profile.state}, {profile.country}. Their registration ID is {profile.regCode}. Additional firm and contact information is listed below.
        </div>

        {/* Biography */}
        {profile.biography && (
          <div>
            <h2 className="text-lg font-semibold text-sky-700 mb-1">Biography</h2>
            <p className="bg-gray-50 p-4 rounded border border-gray-100 text-sm text-gray-700">{profile.biography}</p>
          </div>
        )}

        {/* Internal Notes */}
        {profile.notes && (
          <div>
            <h2 className="text-lg font-semibold text-yellow-700 mb-1">Internal Notes</h2>
            <p className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-gray-700">{profile.notes}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-sky-50 border border-sky-100 rounded-md p-4 text-sm text-gray-800">
          {profile.emailAddress && (
            <p><HiOutlineMail className="inline mr-2 text-sky-600" />
              <a href={`mailto:${profile.emailAddress}`} className="text-sky-700 hover:underline">{profile.emailAddress}</a>
            </p>
          )}
          {profile.phoneNumber && (
            <p><HiOutlinePhone className="inline mr-2 text-sky-600" />
              <a href={`tel:${profile.phoneNumber}`} className="text-sky-700 hover:underline">{profile.phoneNumber}</a>
            </p>
          )}
          {profile.firmUrl && (
            <p><HiOutlineGlobe className="inline mr-2 text-sky-600" />
              <a href={profile.firmUrl.startsWith('http') ? profile.firmUrl : `https://${profile.firmUrl}`} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">
                {profile.firmUrl}
              </a>
            </p>
          )}
          {profile.linkedInProfile && (
            <p><svg className="inline w-4 h-4 text-sky-600 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.38-1.1 2.5-2.48 2.5C1.11 6 0 4.88 0 3.5 0 2.12 1.11 1 2.5 1S5 2.12 5 3.5zM0 24h5V7H0v17zM7.8 7h4.8v2.4h.1c.7-1.3 2.4-2.7 4.9-2.7 5.3 0 6.3 3.5 6.3 8v9.3h-5V16c0-2.2 0-5-3-5s-3.5 2.3-3.5 4.8V24H7.8V7z"/></svg>
              <a href={profile.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">LinkedIn</a>
            </p>
          )}
        </div>

        {/* Details Section */}
        <div>
          <h2 className="text-lg font-semibold text-sky-800 mt-6 mb-2">Profile Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {Object.entries(profile).map(([key, value], i) =>
              value && typeof value === 'string' && key !== '_id' && key !== 'biography' && key !== 'notes' && key !== 'admin' && key !== 'userId' && (
                <div key={i} className="bg-gray-50 border border-gray-100 p-3 rounded">
                  <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                </div>
              )
            )}
          </div>
        </div>

        {/* Map (Optional) */}
        {profile.city && profile.state && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-sky-800 mb-2">📍 Office Location</h2>
            <iframe
              className="w-full h-60 rounded border border-gray-300"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${profile.city}, ${profile.state}`)}&output=embed`}
              title="Google Map"
            ></iframe>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 text-sm"
          >
            ← Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetail;
