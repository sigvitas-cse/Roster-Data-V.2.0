import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const InsightsData = () => {
  const [insights, setInsights] = useState(null);
  const [selectedInsightIndex, setSelectedInsightIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL; // Vite-compatible environment variable

  useEffect(() => {
    document.title = "Data Insights - Patent Analyst Dashboard";
    fetchInsights();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/insights`);
      setInsights(response.data);
      setLoading(false);
      console.log('API Response:', response.data);
      console.log('organizationMovers:', response.data.organizationMovers);
      console.log('nameChanges:', response.data.nameChanges);
      console.log('organizationChanges:', response.data.organizationChanges);
      console.log('addressChanges:', response.data.addressChanges);
      console.log('phoneChanges:', response.data.phoneChanges);
      console.log('statusChanges:', response.data.statusChangeDetails);
      console.log('changesByState:', response.data.changesByState);
      if (response.data.statusChanges > 0 && (!response.data.statusChangeDetails || response.data.statusChangeDetails.length === 0)) {
        console.warn(`Mismatch: statusChanges is ${response.data.statusChanges}, but statusChangeDetails is empty or missing`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch insights';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // Derive Top Movers (people with multiple changes)
  const topMovers = insights?.organizationMovers?.filter(mover => 
    Object.keys(mover.changes).length > 1
  ) || [];

  // Derive All Organizations
  const allOrganizations = () => {
    const orgSet = new Set();
    const normalizeName = (name) => {
      if (!name || typeof name !== 'string') return null;
      return name.trim().toLowerCase()
        .replace(/[,;&]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/llp/g, 'llp')
        .replace(/p\.c\./g, 'pc');
    };

    insights?.topOrganizations?.forEach(org => {
      const normalized = normalizeName(org.organization);
      if (normalized && normalized !== 'none-retired' && !/attorney at law|consulting|pllc|llc$/.test(normalized)) {
        orgSet.add(org.organization);
      }
    });

    insights?.companyLeavers?.forEach(company => {
      const normalized = normalizeName(company.company);
      if (normalized && normalized !== 'none-retired' && !/attorney at law|consulting|pllc|llc$/.test(normalized)) {
        orgSet.add(company.company);
      }
    });

    insights?.organizationMovers?.forEach(mover => {
      const oldOrg = mover.changes['Organization/Law Firm Name']?.oldValue;
      const newOrg = mover.changes['Organization/Law Firm Name']?.newValue;
      [oldOrg, newOrg].forEach(org => {
        const normalized = normalizeName(org);
        if (normalized && normalized !== 'none-retired' && !/attorney at law|consulting|pllc|llc$/.test(normalized)) {
          orgSet.add(org);
        }
      });
    });

    return Array.from(orgSet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  };

  // Derive Change Counts for Summary
  const getChangeCounts = () => ({
    Name: insights?.nameChanges || 0,
    Organization: insights?.organizationChanges || 0,
    Address: insights?.addressChanges || 0,
    'Phone Number': insights?.phoneChanges || 0,
    Status: insights?.statusChanges || 0
  });

  // Derive Specific Changes
  const nameChanges = insights?.organizationMovers?.filter(mover => mover.changes.Name) || [];
  const orgChanges = insights?.organizationMovers?.filter(mover => mover.changes['Organization/Law Firm Name']) || [];
  const addressChanges = insights?.organizationMovers?.filter(mover => 
    mover.changes['Address Line 1'] || mover.changes['Address Line 2'] || 
    mover.changes.City || mover.changes.State || 
    mover.changes.Country || mover.changes.Zipcode
  ) || [];
  const phoneChanges = insights?.organizationMovers?.filter(mover => mover.changes['Phone Number']) || [];

  const insightPages = [
    {
      id: 'summary-totals',
      title: 'Summary of Totals',
      headers: ['Field', 'Number of Changes'],
      data: () => Object.entries(getChangeCounts()).map(([field, count]) => [field, count]),
    },
    {
      id: 'overview-chart',
      title: 'Change Distribution',
      headers: ['Chart'],
      data: () => [['Distribution Chart']],
      renderCustom: () => (
        <div className="w-full max-w-lg mx-auto">
          <Pie
            data={{
              labels: Object.keys(getChangeCounts()),
              datasets: [{
                label: 'Change Types',
                data: Object.values(getChangeCounts()),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'top' },
                title: {
                  display: true,
                  text: 'Distribution of Changes',
                  font: { size: 14 }
                }
              }
            }}
          />
        </div>
      ),
    },
    {
      id: 'changes-by-state',
      title: 'Changes by State',
      headers: ['State', 'Number of Changes'],
      data: () => insights?.changesByState?.map(item => [item.state || 'Unknown', item.count]) || [],
      renderCustom: () => (
        <div className="w-full max-w-xl mx-auto">
          <Bar
            data={{
              labels: insights?.changesByState?.map(item => item.state || 'Unknown') || [],
              datasets: [{
                label: 'Number of Changes',
                data: insights?.changesByState?.map(item => item.count) || [],
                backgroundColor: '#FFCE56',
                borderColor: '#FFCE56',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Changes' } },
                x: { title: { display: true, text: 'State' } }
              },
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: 'Changes by State',
                  font: { size: 14 }
                }
              }
            }}
          />
        </div>
      ),
    },
    {
      id: 'top-organizations',
      title: 'Top Organizations with Changes',
      headers: ['Organization', 'Number of Changes'],
      data: () => insights?.topOrganizations?.map(org => [org.organization, org.count]) || [],
    },
    {
      id: 'company-leavers',
      title: 'Company Leavers',
      headers: ['Company', 'Total Leavers', 'Reg No.', 'Name', 'Name Change', 'New Organization'],
      data: () => insights?.companyLeavers?.flatMap(company => 
        company.people.map(person => [
          company.company,
          company.count,
          person.regCode,
          person.name,
          person.nameChanged ? `${person.nameChanged.oldValue} → ${person.nameChanged.newValue}` : 'No change',
          person.newOrganization || 'N/A'
        ])
      ) || [],
    },
    {
      id: 'top-movers',
      title: 'Top Movers',
      headers: ['Reg No.', 'Name', 'Changed Fields'],
      data: () => topMovers.map(mover => [
        mover.regCode,
        mover.name,
        Object.keys(mover.changes)
          .map(field => 
            field === 'Organization/Law Firm Name' ? 'Organization' :
            field === 'Phone Number' ? 'Phone Number' :
            ['Address Line 1', 'Address Line 2', 'City', 'State', 'Country', 'Zipcode'].includes(field) ? 'Address' :
            field
          )
          .filter((value, index, self) => self.indexOf(value) === index)
          .join(', ')
      ]) || [],
    },
    {
      id: 'name-changes',
      title: 'Name Changes',
      headers: ['Reg No.', 'Old Name', 'New Name'],
      data: () => nameChanges.map(mover => [
        mover.regCode,
        mover.changes.Name.oldValue || 'N/A',
        mover.changes.Name.newValue || 'N/A'
      ]) || [],
    },
    {
      id: 'organization-changes',
      title: 'Organization Changes',
      headers: ['Reg No.', 'Name', 'Old Organization', 'New Organization'],
      data: () => orgChanges.map(mover => [
        mover.regCode,
        mover.name,
        mover.changes['Organization/Law Firm Name'].oldValue || 'N/A',
        mover.changes['Organization/Law Firm Name'].newValue || 'N/A'
      ]) || [],
    },
    {
      id: 'address-changes',
      title: 'Address Changes',
      headers: ['Reg No.', 'Name', 'Old Address', 'New Address'],
      data: () => addressChanges.map(mover => [
        mover.regCode,
        mover.name,
        [
          mover.changes['Address Line 1']?.oldValue,
          mover.changes['Address Line 2']?.oldValue,
          mover.changes.City?.oldValue,
          mover.changes.State?.oldValue,
          mover.changes.Country?.oldValue,
          mover.changes.Zipcode?.oldValue
        ].filter(Boolean).join(', ') || 'N/A',
        [
          mover.changes['Address Line 1']?.newValue,
          mover.changes['Address Line 2']?.newValue,
          mover.changes.City?.newValue,
          mover.changes.State?.newValue,
          mover.changes.Country?.newValue,
          mover.changes.Zipcode?.newValue
        ].filter(Boolean).join(', ') || 'N/A'
      ]) || [],
    },
    {
      id: 'phone-changes',
      title: 'Phone Number Changes',
      headers: ['Reg No.', 'Name', 'Old Phone Number', 'New Phone Number'],
      data: () => phoneChanges.map(mover => [
        mover.regCode,
        mover.name,
        mover.changes['Phone Number'].oldValue || 'N/A',
        mover.changes['Phone Number'].newValue || 'N/A'
      ]) || [],
    },
    {
      id: 'status-changes',
      title: 'Status Changes',
      headers: ['Reg No.', 'Name', 'Old Status', 'New Status'],
      data: () => insights?.statusChangeDetails?.map(mover => [
        mover.regCode,
        mover.name,
        mover.oldValue || 'N/A',
        mover.newValue || 'N/A'
      ]) || [],
    },
    {
      id: 'organization-movers',
      title: 'All Movers',
      headers: ['Reg No.', 'Name', 'Name Change', 'Organization Change', 'Address Change', 'Phone Number Change', 'Status Change'],
      data: () => insights?.organizationMovers?.map(mover => [
        mover.regCode,
        mover.name,
        mover.changes.Name ? `${mover.changes.Name.oldValue} → ${mover.changes.Name.newValue}` : 'No change',
        mover.changes['Organization/Law Firm Name'] ? `${mover.changes['Organization/Law Firm Name'].oldValue} → ${mover.changes['Organization/Law Firm Name'].newValue}` : 'No change',
        [
          mover.changes['Address Line 1']?.newValue,
          mover.changes['Address Line 2']?.newValue,
          mover.changes.City?.newValue,
          mover.changes.State?.newValue,
          mover.changes.Country?.newValue,
          mover.changes.Zipcode?.newValue
        ].some(Boolean)
          ? [
              mover.changes['Address Line 1']?.oldValue,
              mover.changes['Address Line 2']?.oldValue,
              mover.changes.City?.oldValue,
              mover.changes.State?.oldValue,
              mover.changes.Country?.oldValue,
              mover.changes.Zipcode?.oldValue
            ].filter(Boolean).join(', ') +
            ' → ' +
            [
              mover.changes['Address Line 1']?.newValue,
              mover.changes['Address Line 2']?.newValue,
              mover.changes.City?.newValue,
              mover.changes.State?.newValue,
              mover.changes.Country?.newValue,
              mover.changes.Zipcode?.newValue
            ].filter(Boolean).join(', ')
          : 'No change',
        mover.changes['Phone Number'] ? `${mover.changes['Phone Number'].oldValue} → ${mover.changes['Phone Number'].newValue}` : 'No change',
        mover.changes.Status ? `${mover.changes.Status.oldValue} → ${mover.changes.Status.newValue}` : 'No change'
      ]) || [],
    },
    {
      id: 'all-organizations',
      title: 'All Organizations',
      headers: ['No.', 'Organization'],
      data: () => allOrganizations().map((org, index) => [index + 1, org]),
    },
  ];

  const handleSelectInsight = (index) => {
    setSelectedInsightIndex(index);
    setCurrentPage(1); // Reset to first page when switching insights
  };

  if (loading) return <div className="text-center text-[#64748B] text-[11px]">Loading...</div>;
  if (error) return <div className="text-center text-red-600 text-[11px]">Error: {error}</div>;
  if (!insights) return <div className="text-center text-[#64748B] text-[11px]">No data available</div>;

  const currentInsight = insightPages[selectedInsightIndex];
  const tableData = currentInsight.data();
  const totalPages = Math.ceil(tableData.length / 10);
  const paginatedData = tableData.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  return (
    <div className="p-2 max-h-[calc(100vh-380px)] overflow-auto scrollbar-thin scrollbar-thumb-[#38BDF8]/70 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-w-1.5" style={{ scrollBehavior: 'smooth' }}>
      <div className="bg-gradient-to-r from-[#38BDF8]/80 to-[#60A5FA]/80 text-white p-1 rounded-t-md mb-2">
        <h2 className="text-[12px] font-semibold text-center">Data Insights [{insightPages.length}]</h2>
      </div>
      {/* Text-based Navigation with Separators */}
      <div className="mb-2 flex flex-wrap gap-2">
        {insightPages.map((insight, index) => (
          <React.Fragment key={insight.id}>
            <span
              onClick={() => handleSelectInsight(index)}
              className={`text-[11px] cursor-pointer ${selectedInsightIndex === index ? 'font-bold underline text-blue-600' : 'hover:text-blue-500 transition-colors duration-150'}`}
            >
              {insight.title}
            </span>
            {index < insightPages.length - 1 && <span className="text-[11px] text-gray-400"> | </span>}
          </React.Fragment>
        ))}
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] bg-white rounded-md scrollbar-thin scrollbar-thumb-[#38BDF8]/70 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-w-1.5" style={{ scrollBehavior: 'smooth' }}>
        <table className="w-full border-collapse text-[11px] text-[#1E293B]">
          <thead className="bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white sticky top-0 z-10">
            <tr>
              {currentInsight.headers.map((header, index) => (
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
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#F8FAFC] even:bg-gray-50 transition-colors duration-150"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`p-1 border-b border-[#CBD5E1] text-[10px] ${cellIndex === 0 ? 'text-center' : 'max-w-[120px] truncate'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentInsight.headers.length} className="text-center p-3 text-[#64748B] text-[11px]">
                  No data found.
                </td>
              </tr>
            )}
            {currentInsight.renderCustom && (
              <tr>
                <td colSpan={currentInsight.headers.length} className="p-4">
                  {currentInsight.renderCustom()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {tableData.length > 10 && (
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default InsightsData;