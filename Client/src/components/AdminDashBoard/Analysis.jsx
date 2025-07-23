import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LineChartComponent from '../Analysis/LineChartComponent';
import BarChartComponent from '../Analysis/BarChartComponent.jsx';
import PieChartComponent from '../Analysis/PieChartComponent';

function Analysis() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [displayMode, setDisplayMode] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const graphHeight = useRef(0);

 const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/analysis`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        const formattedData = response.data.map((item) => {
          const dateObj = new Date(item.timestamp);
          return {
            week: dateObj.toLocaleDateString(),
            totalProfiles: item.total,
            revisedProfiles: item.updated,
            removedProfiles: item.removed,
            newProfiles: item.new,
            month: dateObj.toLocaleString('default', { month: 'short', year: 'numeric' }),
            rawDate: dateObj,
          };
        });

        setWeeklyData(formattedData.slice(-4));
        const monthMap = new Map();
        formattedData.forEach((entry) => {
          const existing = monthMap.get(entry.month);
          if (!existing || entry.rawDate > existing.rawDate) {
            monthMap.set(entry.month, { ...entry });
          }
        });
        const monthlyList = Array.from(monthMap.values())
          .sort((a, b) => a.rawDate - b.rawDate)
          .map(({ rawDate, ...rest }) => rest);

        setMonthlyData(monthlyList);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch analysis data');
        setLoading(false);
        toast.error(error.response?.data?.message || 'Failed to fetch analysis data');
      }
    };

    fetchAnalysisData();
  }, []);

  const getPieData = (data) => [
    { name: 'Revised', value: data.reduce((acc, d) => acc + d.revisedProfiles, 0) },
    { name: 'Removed', value: data.reduce((acc, d) => acc + d.removedProfiles, 0) },
    { name: 'New', value: data.reduce((acc, d) => acc + d.newProfiles, 0) },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateGraphHeight = () => {
      const firstGraph = container.querySelector('.graph-section');
      if (firstGraph) {
        graphHeight.current = firstGraph.offsetHeight;
      }
    };

    updateGraphHeight();
    window.addEventListener('resize', updateGraphHeight);

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1; // 1 for down, -1 for up
      const newPosition = Math.max(0, Math.min(scrollPosition + delta * graphHeight.current, container.scrollHeight - container.clientHeight));
      setScrollPosition(newPosition);
      container.scrollTo({ top: newPosition, behavior: 'smooth' });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', updateGraphHeight);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scrollPosition, displayMode]);

  if (loading) return <p className="text-center text-[#64748B] text-[11px]">Loading data...</p>;
  if (error) return <p className="text-center text-[#EF4444] text-[11px]">{error}</p>;

  const displayedData = displayMode === 'weekly' ? weeklyData : monthlyData;

  return (
    <div ref={containerRef} className="p-2 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#38BDF8]/70 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-w-1.5" style={{ scrollBehavior: 'smooth' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="bg-gradient-to-r from-[#38BDF8]/80 to-[#60A5FA]/80 text-white p-1 rounded-t-md mb-2">
        <h2 className="text-[12px] font-semibold text-center">Analysis Dashboard</h2>
      </div>
      <div className="flex gap-1 mb-2">
        <button
          className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
            displayMode === 'weekly' ? 'bg-[#38BDF8] text-white' : 'bg-gray-200 text-[#1E293B] hover:bg-gray-300'
          } relative group`}
          onClick={() => setDisplayMode('weekly')}
          aria-label="View weekly analysis"
        >
          Weekly Data
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black/75 text-white text-[10px] px-1 py-0.5 rounded-md">
            View weekly analysis
          </span>
        </button>
        <button
          className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
            displayMode === 'monthly' ? 'bg-[#38BDF8] text-white' : 'bg-gray-200 text-[#1E293B] hover:bg-gray-300'
          } relative group`}
          onClick={() => setDisplayMode('monthly')}
          aria-label="View monthly analysis"
        >
          Monthly Data
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black/75 text-white text-[10px] px-1 py-0.5 rounded-md">
            View monthly analysis
          </span>
        </button>
      </div>
      <div className="bg-white p-2 border border-[#CBD5E1] rounded-md shadow-sm">
        <div className="bg-white/90 p-2 rounded-md shadow-sm mb-2 relative graph-section">
          <h3 className="text-center text-[12px] font-semibold text-[#1E293B] mb-1">
            Profile Updates Over {displayMode === 'weekly' ? 'Weeks' : 'Months'}
          </h3>
          {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md"><span className="text-[11px] text-[#64748B]">Loading chart...</span></div>}
          <LineChartComponent data={displayedData} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="bg-white/90 p-2 rounded-md shadow-sm relative graph-section">
            <h3 className="text-center text-[12px] font-semibold text-[#1E293B] mb-1">
              Profile Changes Per {displayMode === 'weekly' ? 'Week' : 'Month'}
            </h3>
            {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md"><span className="text-[11px] text-[#64748B]">Loading chart...</span></div>}
            <BarChartComponent data={displayedData} />
          </div>
          <div className="bg-white/90 p-2 rounded-md shadow-sm relative graph-section min-h-[250px]">
            <h3 className="text-center text-[12px] font-semibold text-[#1E293B] mb-1">
              Total Changes Distribution
            </h3>
            {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md"><span className="text-[11px] text-[#64748B]">Loading chart...</span></div>}
            <PieChartComponent data={getPieData(displayedData)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;