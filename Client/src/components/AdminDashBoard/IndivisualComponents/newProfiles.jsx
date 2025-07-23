import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NewProfilesUpdated() {
  const [data1, setData1] = useState([]);
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {
    const fetchNewProfiles = async () => {
      try {
        const newlyAddedProfiles = await axios.get(`${API_URL}/api/newlyAddedProfiles2`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setResult(newlyAddedProfiles.data);
        if (newlyAddedProfiles.status === 200) {
          setData1(newlyAddedProfiles.data);
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      }
    };

    fetchNewProfiles();
  }, []);

  const tableHeaders = [
    'S. No.',
    'Name',
    'Organization',
    'Address Line 1',
    'Address Line 2',
    'City',
    'State',
    'Country',
    'Zipcode',
    'Phone Number',
    'Reg No.',
    'Attorney',
  ];

  const paginatedData = data1.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(data1.length / rowsPerPage);

  return (
    <div className="p-2">
      <h2 className="text-[12px] font-semibold text-[#1E293B] mb-2 text-center">
        New Profiles [{result.length}]
      </h2>
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] bg-white rounded-md scrollbar-thin scrollbar-thumb-[#38BDF8] scrollbar-track-gray-100 scrollbar-thumb-rounded scrollbar-w-1" style={{ scrollBehavior: 'smooth' }}>
        <table className="w-full border-collapse text-[11px] text-[#1E293B]">
          <thead className="bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white sticky top-0 z-10">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className="p-1 text-left text-[10px] font-semibold whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((profile, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#F8FAFC] even:bg-gray-50 transition-colors duration-150"
                >
                  <td className="p-1 border-b border-[#CBD5E1] text-[10px] text-center">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[200px] truncate">{profile.name}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[120px] truncate">{profile.organization}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[120px] truncate">{profile.addressLine1}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate">{profile.addressLine2}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate">{profile.city}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate">{profile.state}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate">{profile.country}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate">{profile.zipcode}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[100px] truncate">{profile.phoneNumber}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[60px] truncate">{profile.regCode}</td>
                  <td className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate">{profile.agentAttorney}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center p-3 text-[#64748B] text-[11px]">
                  No profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data1.length > rowsPerPage && (
        <div className="flex justify-center mt-1 gap-0.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-1 py-0.5 text-[11px] text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white rounded-md transition-all duration-150 disabled:opacity-50"
          >
            {'<'}
          </button>
          <span className="text-[11px] text-[#1E293B]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-1 py-0.5 text-[11px] text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white rounded-md transition-all duration-150 disabled:opacity-50"
          >
            {'>'}
          </button>
        </div>
      )}
    </div>
  );
}

export default NewProfilesUpdated;