import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Note = ({ userId }) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = 'Insights - Patent Analyst Dashboard';
    window.history.replaceState(null, '', window.location.pathname);
    const token = localStorage.getItem('authToken');
    if (!token || !userId) {
      toast.error('Please log in to access Insights');
      navigate('/EmpLoginPage');
      return;
    }
    const lastNoteId = localStorage.getItem(`lastNoteId_${userId}`);
    fetchNotes(lastNoteId);
  }, [navigate, userId]);

  const fetchNotes = async (noteIdToSelect = null) => {
    try {
      const response = await axios.get(`${API_URL}/api/notes?userId=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setNotes(response.data.data);
      if (noteIdToSelect) {
        const noteToSelect = response.data.data.find((note) => note._id === noteIdToSelect);
        if (noteToSelect) {
          setSelectedNoteId(noteToSelect._id);
          setNoteTitle(noteToSelect.title);
          setCurrentNote(noteToSelect.content);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        navigate('/EmpLoginPage');
      } else {
        toast.error('Failed to fetch notes');
      }
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !currentNote.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const noteData = {
      userId,
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
      localStorage.setItem(`lastNoteId_${userId}`, newNote._id);
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
      localStorage.setItem(`lastNoteId_${userId}`, selectedNoteId);
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
        localStorage.removeItem(`lastNoteId_${userId}`);
      }
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNoteId(note._id);
    setNoteTitle(note.title);
    setCurrentNote(note.content);
    localStorage.setItem(`lastNoteId_${userId}`, note._id);
  };

  const handleNewNote = () => {
    setNoteTitle('');
    setCurrentNote('');
    setSelectedNoteId(null);
    localStorage.removeItem(`lastNoteId_${userId}`);
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

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gray-100 p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Insights</h1>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/3 bg-white p-4 border border-gray-200 rounded-md shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Notes</h2>
            {notes.length === 0 ? (
              <p className="text-gray-500 text-sm">No notes yet.</p>
            ) : (
              <ol className="list-decimal pl-5 space-y-2">
                {notes.map((note) => (
                  <li
                    key={note._id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedNoteId === note._id ? 'bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{note.title}</span>
                      <button
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="lg:w-2/3 bg-white p-6 border border-gray-200 rounded-md shadow-sm">
            <input
              type="text"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Note Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <ReactQuill
              theme="snow"
              value={currentNote}
              onChange={setCurrentNote}
              modules={quillModules}
              formats={quillFormats}
              className="mb-6 bg-white border border-gray-300 rounded-md"
              placeholder="Start typing your note here..."
            />
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                onClick={selectedNoteId ? handleUpdateNote : handleSaveNote}
              >
                {selectedNoteId ? 'Update' : 'Save'}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleNewNote}
              >
                New Note
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note;