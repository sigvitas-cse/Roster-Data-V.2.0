import React, { useState } from "react";
import axios from "axios";

function IndivisualProfilesUpdated({ onClick }) {
  const [regCodeInput, setRegCodeInput] = useState("");
  const [matchingProfile, setMatchingProfile] = useState([]);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState("regCode");

  const API_URL = process.env.REACT_APP_API_URL;


  const handleSearch = async () => {
    if (!regCodeInput.trim()) {
      setError("Please enter a register number.");
      setMatchingProfile([]);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
        params: {
          field: searchField,
          query: regCodeInput,
        },
      });

      const profiles = response.data;
      console.log("Receive Data:", profiles);

      if (Array.isArray(profiles) && profiles.length > 0) {
        setMatchingProfile(profiles);
        setError("");
      } else {
        setMatchingProfile([]);
        setError("No matching profiles found.");
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setMatchingProfile(null);
      setError("Server error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]">
      <div className="bg-white p-6 rounded-lg w-[95%] max-h-[90vh] overflow-auto shadow-xl font-sans relative">
        <button
          className="absolute top-3 right-4 bg-transparent border-none text-3xl text-red-500 hover:text-gray-700 cursor-pointer"
          onClick={onClick}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold">Search Profile</h2>

        <div className="flex gap-3 mt-5">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="p-2 border border-gray-400 rounded-md text-sm"
          >
            <option value="regCode">Reg No.</option>
            <option value="name">Name</option>
            <option value="organization">Organization</option>
            <option value="city">City</option>
          </select>

          <input
            type="text"
            placeholder={`Enter ${searchField}`}
            value={regCodeInput}
            onChange={(e) => setRegCodeInput(e.target.value)}
            className="flex-1 p-2 border border-gray-400 rounded-md text-sm"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-blue-500 text-white font-bold border-none rounded-md cursor-pointer hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        {error && <p className="text-red-500 font-bold mt-2 mb-2">{error}</p>}

        {matchingProfile.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse text-sm bg-gray-50">
              <thead>
                <tr>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Sl.No</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Name</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Organization</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Address Line 1</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Address Line 2</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">City</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">State</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Country</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Zipcode</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Phone</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Reg No.</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Attorney</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Date of Patent</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Agent Licensed</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Firm</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Updated Phone</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Email</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Updated Org</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Website</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Updated Address</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Updated City</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Updated State</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Updated Country</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Updated Zipcode</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">LinkedIn</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Notes</th>
                  <th className="border border-gray-400 p-2 text-left bg-blue-500 text-white font-bold whitespace-nowrap">Data Updated As On</th>
                </tr>
              </thead>
              <tbody>
                {matchingProfile.map((profile, index) => (
                  <tr key={index} className="even:bg-gray-100 hover:bg-blue-50">
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{index + 1}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.name}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.organization}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.addressLine1}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.addressLine2}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.city}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.state}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.country}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.zipcode}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.phoneNumber}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.regCode}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.agentAttorney}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.dateOfPatent}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.agentLicensed}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.firmOrOrganization}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.updatedPhoneNumber}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.emailAddress}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.updatedOrganization}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">
                      <a href={profile.firmUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {profile.firmUrl}
                      </a>
                    </td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.updatedAddress}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.updatedCity}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.updatedState}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.updatedCountry}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.updatedZipcode}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">
                      <a href={profile.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {profile.linkedInProfile}
                      </a>
                    </td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.notes}</td>
                    <td className="border border-gray-400 p-2 text-left bg-white text-gray-700 whitespace-nowrap">{profile.dataUpdatedAsOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndivisualProfilesUpdated;