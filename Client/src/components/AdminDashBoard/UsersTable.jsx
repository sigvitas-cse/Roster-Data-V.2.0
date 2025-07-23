import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [retry, setRetry] = useState(false); // State to trigger refetch
  
const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {
    fetchUsers();
  }, [retry]); // Refetch when retry changes

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/all-users`);
      if (response.status === 200) {
        setUsers(response.data.data);
      } else {
        toast.error("Failed to fetch users.", { position: "top-center" });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("An error occurred while fetching users. Please try again later.", { position: "top-center" });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/delete-user/${userId}`);
      if (response.status === 200) {
        toast.success("User deleted successfully.", { position: "top-center" });
        setUsers(users.filter((user) => user.userId !== userId));
      } else {
        toast.error("Failed to delete user.", { position: "top-center" });
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("An error occurred while deleting the user.", { position: "top-center" });
    }
  };

  const handleRetry = () => {
    setRetry((prev) => !prev); // Toggle retry to trigger useEffect
  };

  return (
    <section className="w-[90%] max-w-5xl mx-auto my-6 p-6 bg-white rounded-xl shadow-md border border-[#CBD5E1] text-[#1E293B]">
      <h2 className="text-2xl font-bold mb-6">All Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white">
              <th className="p-3 text-left text-base font-semibold whitespace-nowrap">S. No.</th>
              <th className="p-3 text-left text-base font-semibold whitespace-nowrap">User ID</th>
              <th className="p-3 text-left text-base font-semibold whitespace-nowrap">Name</th>
              <th className="p-3 text-left text-base font-semibold whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.userId}
                  className="hover:bg-[#F8FAFC] transition-colors duration-200"
                >
                  <td className="p-3 border-b border-[#CBD5E1] text-base whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="p-3 border-b border-[#CBD5E1] text-base whitespace-nowrap">
                    {user.userId}
                  </td>
                  <td className="p-3 border-b border-[#CBD5E1] text-base whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="p-3 border-b border-[#CBD5E1] text-base whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(user.userId)}
                      className="text-[#EF4444] hover:text-[#DC2626] transition-colors duration-200"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-[#64748B]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Users;