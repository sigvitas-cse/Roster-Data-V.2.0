import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UpdatedProfiles() {
  const [data1, setData1] = useState([]);
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {
    const fetchUpdatedProfiles = async () => {
      try {
        const updatedProfilesResponse = await axios.get(`${API_URL}/api/updated-profiles`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setResult(updatedProfilesResponse.data);
        if (updatedProfilesResponse.status === 200) {
          setData1(updatedProfilesResponse.data);
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      }
    };

    fetchUpdatedProfiles();
  }, []);

  const tableHeaders = ['S. No.', 'Rig No.', 'Name', 'Field', 'Old Value', 'New Value'];

  const paginatedData = data1.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(data1.length / rowsPerPage);

  return (
    <div className="p-2">
      <h2 className="text-[12px] font-semibold text-[#1E293B] mb-2 text-center">
        Updated Profiles [{result.length}]
      </h2>
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] bg-white rounded-md">
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
              paginatedData.map((profile, profileIndex) =>
                Object.entries(profile.changes).map(([field, values], fieldIndex) => (
                  <tr key={profile.regCode + field} className="hover:bg-[#F8FAFC] even:bg-gray-50 transition-colors duration-150">
                    {fieldIndex === 0 && (
                      <>
                        <td
                          rowSpan={Object.keys(profile.changes).length}
                          className="p-1 border-b border-[#CBD5E1] text-center"
                        >
                          {(currentPage - 1) * rowsPerPage + profileIndex + 1}
                        </td>
                        <td
                          rowSpan={Object.keys(profile.changes).length}
                          className="p-1 border-b border-[#CBD5E1] max-w-[50px] truncate"
                        >
                          {profile.regCode}
                        </td>
                        <td
                          rowSpan={Object.keys(profile.changes).length}
                          className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate"
                        >
                          {profile.name}
                        </td>
                      </>
                    )}
                    <td className="p-1 border-b border-[#CBD5E1] max-w-[80px] truncate">{field}</td>
                    <td className="p-1 border-b border-[#CBD5E1] max-w-[100px] truncate">{values.oldValue || 'N/A'}</td>
                    <td className="p-1 border-b border-[#CBD5E1] max-w-[100px] truncate">{values.newValue || 'N/A'}</td>
                  </tr>
                ))
              )
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

export default UpdatedProfiles;