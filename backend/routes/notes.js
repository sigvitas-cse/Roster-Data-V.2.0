const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Note Schema
const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Note = mongoose.model("Note", noteSchema);

// Get all notes for a user
router.get("/notes", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    res.json({ data: notes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Get all notes (for admin)
router.get("/all-notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json({ data: notes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all notes" });
  }
});

// Create a new note
router.post("/notes", async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    if (!userId || !title || !content) {
      return res.status(400).json({ error: "userId, title, and content are required" });
    }
    const note = new Note(req.body);
    await note.save();
    res.status(201).json({ data: note });
  } catch (error) {
    res.status(500).json({ error: "Failed to save note" });
  }
});

// Update a note
router.put("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ data: note });
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete a note
router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

module.exports = router;