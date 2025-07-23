import React, { useState } from "react";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";

function NewUploadExcel({ onClose, userId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
 const API_URL = import.meta.env.VITE_API_URL;


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); // Clear message on file change
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file);
    formData.append("userId", userId); // Use userId from props only

    console.log("Sending userId:", userId);

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/upload-excel-dynamic`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadMessage = res.data.message || "✅ Upload successful.";
      setMessage(uploadMessage);
      if (uploadMessage.includes("✅")) {
        onUploadSuccess(); // Trigger refetch in EmployeeDashboard
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] relative flex justify-center items-center p-">
      <div className="bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] p-6 rounded-xl shadow-lg w-full max-w-md border border-[#CBD5E1] animate-slideIn">
        <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2 mb-4">
          <i className="fa-solid fa-upload text-[#38BDF8] text-lg" />
          Upload Excel File
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="p-2 border border-[#CBD5E1] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#60A5FA]/20 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#F8FAFC] file:text-sm file:font-semibold file:text-[#38BDF8] file:hover:bg-[#E6F0FA]"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-sm font-semibold rounded-lg hover:from-[#2B9FE7] hover:to-[#4B8EF1] active:scale-95 transition-all duration-200 disabled:bg-[#E2E8F0] disabled:cursor-not-allowed shadow-md flex items-center justify-center"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2 text-sm" />
                Uploading...
              </>
            ) : (
              <>
                <i className="fa-solid fa-upload mr-2 text-sm" />
                Upload
              </>
            )}
          </button>
        </div>
        {message && (
          <div className="mt-4 p-2 bg-white border border-[#CBD5E1] rounded-lg text-sm font-semibold text-center">
            {message.includes("✅") ? (
              <span className="text-green-600">{message}</span>
            ) : (
              <span className="text-red-600">{message}</span>
            )}
            {message.includes("✅") && (
              <button
                onClick={onClose}
                className="ml-2 px-2 py-1 bg-[#38BDF8] text-white text-xs rounded hover:bg-[#2B9FE7] transition-all duration-200"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewUploadExcel;