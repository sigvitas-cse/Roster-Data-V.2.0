import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Note = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminUserId = location.state?.userId;
  const [notes, setNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [currentNote, setCurrentNote] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteUserId, setNoteUserId] = useState(adminUserId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const notesListRef = useRef(null);

const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    document.title = 'Admin Insights - Patent Analyst Dashboard';
    window.history.replaceState(null, '', window.location.pathname);
    const token = localStorage.getItem('authToken');
    if (!token || !adminUserId) {
      toast.error('Please log in to access Admin Insights');
      navigate('/Login');
      return;
    }
    const lastNoteId = localStorage.getItem(`lastAdminNoteId_${adminUserId}`);
    fetchNotes(lastNoteId);
  }, [navigate, adminUserId]);

  const fetchNotes = async (noteIdToSelect = null) => {
    try {
      const response = await axios.get(`${API_URL}/api/all-notes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setNotes(response.data.data);
      if (noteIdToSelect) {
        const noteToSelect = response.data.data.find((note) => note._id === noteIdToSelect);
        if (noteToSelect) {
          setSelectedNoteId(noteToSelect._id);
          setNoteTitle(noteToSelect.title);
          setCurrentNote(noteToSelect.content);
          setNoteUserId(noteToSelect.userId);
        }
      }
      setSelectedNotes(new Set());
    } catch (error) {
      console.error('Error fetching notes:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        navigate('/AdminLoginPage');
      } else {
        toast.error('Failed to fetch notes');
      }
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !currentNote.trim() || !noteUserId) {
      toast.error('Title, content, and user ID are required');
      return;
    }

    const noteData = {
      userId: noteUserId,
      title: noteTitle,
      content: currentNote,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await axios.post(`${API_URL}/api/notes`, noteData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      const newNote = response.data.data;
      toast.success('Note saved successfully');
      setSelectedNoteId(newNote._id);
      setNoteTitle(newNote.title);
      setCurrentNote(newNote.content);
      setNoteUserId(newNote.userId);
      localStorage.setItem(`lastAdminNoteId_${adminUserId}`, newNote._id);
      fetchNotes(newNote._id);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNoteId) {
      toast.error('No note selected for update');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/notes/${selectedNoteId}`,
        { title: noteTitle, content: currentNote },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const updatedNote = response.data.data;
      toast.success('Note updated successfully');
      setNoteTitle(updatedNote.title);
      setCurrentNote(updatedNote.content);
      setNoteUserId(updatedNote.userId);
      localStorage.setItem(`lastAdminNoteId_${adminUserId}`, selectedNoteId);
      fetchNotes(selectedNoteId);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`${API_URL}/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      toast.success('Note deleted successfully');
      if (selectedNoteId === noteId) {
        setNoteTitle('');
        setCurrentNote('');
        setSelectedNoteId(null);
        setNoteUserId(adminUserId);
        localStorage.removeItem(`lastAdminNoteId_${adminUserId}`);
      }
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotes.size === 0) {
      toast.error('No notes selected for deletion');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedNotes.size} note(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedNotes).map((noteId) =>
          axios.delete(`${API_URL}/api/notes/${noteId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          })
        )
      );
      toast.success(`${selectedNotes.size} note(s) deleted successfully`);
      setSelectedNotes(new Set());
      if (selectedNotes.has(selectedNoteId)) {
        setNoteTitle('');
        setCurrentNote('');
        setSelectedNoteId(null);
        setNoteUserId(adminUserId);
        localStorage.removeItem(`lastAdminNoteId_${adminUserId}`);
      }
      fetchNotes();
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast.error('Failed to delete some or all notes');
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNoteId(note._id);
    setNoteTitle(note.title);
    setCurrentNote(note.content);
    setNoteUserId(note.userId);
    localStorage.setItem(`lastAdminNoteId_${adminUserId}`, note._id);
  };

  const handleNewNote = () => {
    setNoteTitle('');
    setCurrentNote('');
    setSelectedNoteId(null);
    setNoteUserId(adminUserId);
    localStorage.removeItem(`lastAdminNoteId_${adminUserId}`);
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  };

  const quillFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'align', 'link'];

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredNotes.length / rowsPerPage);

  return (
    <div className="p-2 max-h-[calc(100vh-380px)] overflow-auto scrollbar-thin scrollbar-thumb-[#38BDF8]/70 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-w-1.5" style={{ scrollBehavior: 'smooth' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="bg-gradient-to-r from-[#38BDF8]/80 to-[#60A5FA]/80 text-white p-1 rounded-t-md mb-2">
        <h2 className="text-[12px] font-semibold text-center">Admin Insights</h2>
      </div>
      <div className="flex flex-col lg:flex-row gap-1">
        <div className="lg:w-1/3 bg-white p-1 border border-[#CBD5E1] rounded-md shadow-sm">
          <div className="flex items-center mb-1">
            <input
              type="text"
              className="w-full p-0.5 border border-[#CBD5E1] rounded-md text-[11px] text-[#1E293B] focus:ring-1 focus:ring-[#38BDF8] focus:border-[#38BDF8] outline-none"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search notes by title, user ID, or content"
            />
            <button
              className="ml-1 px-1 py-0.5 bg-[#EF4444] text-white text-[11px] font-medium rounded-md hover:bg-[#DC2626] transition-colors"
              onClick={handleDeleteSelected}
              disabled={selectedNotes.size === 0}
            >
              Delete Selected
            </button>
          </div>
          <label className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={selectedNotes.size === filteredNotes.length && filteredNotes.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedNotes(new Set(filteredNotes.map((note) => note._id)));
                } else {
                  setSelectedNotes(new Set());
                }
              }}
              className="mr-1"
              aria-label="Select all notes"
            />
            <span className="text-[11px] text-[#1E293B]">Select All</span>
          </label>
          {filteredNotes.length === 0 ? (
            <p className="text-[11px] text-[#64748B] p-0.5">No notes found.</p>
          ) : (
            <ol className="list-decimal pl-1 space-y-0.5 overflow-y-auto max-h-[calc(50vh-150px)] scrollbar-thin scrollbar-thumb-[#38BDF8]/70 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-w-1.5" style={{ scrollBehavior: 'smooth' }}>
              {paginatedNotes.map((note) => (
                <li
                  key={note._id}
                  className={`p-0.5 rounded cursor-pointer transition-opacity duration-300 ${
                    selectedNoteId === note._id ? 'bg-[#E0F2FE]' : 'hover:bg-[#F8FAFC]'
                  } ${selectedNotes.has(note._id) ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelectNote(note)}
                  style={{ opacity: selectedNotes.has(note._id) ? 0.9 : 1 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedNotes.has(note._id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedNotes);
                          if (e.target.checked) {
                            newSelected.add(note._id);
                          } else {
                            newSelected.delete(note._id);
                          }
                          setSelectedNotes(newSelected);
                        }}
                        className="mr-1"
                        aria-label={`Select note ${note.title}`}
                      />
                      <span className="text-[11px] font-medium text-[#1E293B]">
                        {note.title} (User: {note.userId})
                      </span>
                    </div>
                    <button
                      className="text-[10px] text-[#EF4444] hover:text-[#DC2626]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          )}
          {filteredNotes.length > rowsPerPage && (
            <div className="flex justify-center mt-0.5 gap-0.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-1 py-0.5 text-[11px] text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white rounded-md transition-all duration-150 disabled:opacity-50"
                aria-label="Previous page"
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
                aria-label="Next page"
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
        <div className="lg:w-2/3 bg-white p-1 border border-[#CBD5E1] rounded-md shadow-sm">
          <input
            type="text"
            className="w-full p-0.5 mb-0.5 border border-[#CBD5E1] rounded-md text-[11px] text-[#1E293B] focus:ring-1 focus:ring-[#38BDF8] focus:border-[#38BDF8] outline-none"
            placeholder="Note Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            aria-label="Note title"
          />
          <input
            type="text"
            className="w-full p-0.5 mb-0.5 border border-[#CBD5E1] rounded-md text-[11px] text-[#1E293B] focus:ring-1 focus:ring-[#38BDF8] focus:border-[#38BDF8] outline-none"
            placeholder="User ID"
            value={noteUserId}
            onChange={(e) => setNoteUserId(e.target.value)}
            aria-label="User ID"
          />
          <ReactQuill
            theme="snow"
            value={currentNote}
            onChange={setCurrentNote}
            modules={quillModules}
            formats={quillFormats}
            className="mb-0.5 bg-white border border-[#CBD5E1] rounded-md text-[11px] max-h-[calc(50vh-150px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#38BDF8]/70 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-w-1.5"
            placeholder="Start typing your note here..."
            style={{ scrollBehavior: 'smooth' }}
            aria-label="Note content editor"
          />
          <div className="flex gap-0.5">
            <button
              className="px-1 py-0.5 bg-[#22C55E] text-white text-[11px] font-medium rounded-md hover:bg-[#16A34A] transition-colors duration-200"
              onClick={selectedNoteId ? handleUpdateNote : handleSaveNote}
              aria-label={selectedNoteId ? 'Update note' : 'Save note'}
            >
              {selectedNoteId ? 'Update' : 'Save'}
            </button>
            <button
              className="px-1 py-0.5 bg-[#3B82F6] text-white text-[11px] font-medium rounded-md hover:bg-[#2563EB] transition-colors duration-200"
              onClick={handleNewNote}
              aria-label="New note"
            >
              New Note
            </button>
            <button
              className="px-1 py-0.5 bg-[#64748B] text-white text-[11px] font-medium rounded-md hover:bg-[#475569] transition-colors duration-200"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note;