import { Router } from "express";
import Meeting from "../model/meeting_model.js";

const router = Router();

// ---------------- CREATE MEETING ----------------
router.post("/create", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const meeting_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const meeting = await Meeting.create({
      user_id,
      meeting_code
    });

    // Return the meeting as "room" to match frontend expectations
    res.json({ success: true, meeting });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE ROOM
router.delete("/:room_id", async (req, res) => {
  try {
    const { room_id } = req.params;
    const deleted = await Meeting.findByIdAndDelete(room_id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.json({ success: true, message: "Room deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ---------------- GET ALL MEETINGS OF USER ----------------
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const meetings = await Meeting.find({ user_id }).sort({ date: -1 });

    // Return as "rooms" so frontend matches
    res.json({ success: true, rooms: meetings });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
