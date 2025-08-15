const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail"); // 📧 Email utility

const router = express.Router();

// Create ticket (user only)
router.post("/", authMiddleware, (req, res) => {
  const { title, description, priority } = req.body;
  const userId = req.user.id;

  db.query(
    "INSERT INTO tickets (user_id, title, description, priority) VALUES (?, ?, ?, ?)",
    [userId, title, description, priority || "medium"],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Ticket created successfully" });
    }
  );
});

// Get all tickets (admin only)
router.get("/", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const search = req.query.search ? `%${req.query.search}%` : "%%";

  const sql = `
    SELECT t.*, u.name AS user_name, u.email
    FROM tickets t
    JOIN users u ON t.user_id = u.id
    WHERE t.title LIKE ? OR t.status LIKE ? OR u.name LIKE ?
    ORDER BY t.created_at DESC
  `;

  db.query(sql, [search, search, search], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get my tickets (always fetch fresh data)
router.get("/my", authMiddleware, (req, res) => {
  const sql = `
    SELECT id, title, description, priority, status, created_at
    FROM tickets
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Update ticket status (admin only) + send email
router.put("/:id/status", authMiddleware, (req, res) => {
  const { status } = req.body;
  const ticketId = req.params.id;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  db.query(
    "SELECT t.title, u.email, u.name FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.id = ?",
    [ticketId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: "Ticket not found" });

      const ticket = results[0];

      db.query("UPDATE tickets SET status = ? WHERE id = ?", [status, ticketId], async (err2) => {
        if (err2) return res.status(500).json({ error: err2 });

        try {
          await sendEmail(
            ticket.email,
            `Ticket Status Updated: ${ticket.title}`,
            `Hello ${ticket.name},\n\nYour ticket "${ticket.title}" status has been updated to: ${status}.\n\nRegards,\nHelpdeskPro Team`
          );
        } catch (emailErr) {
          console.error("Error sending email:", emailErr);
        }

        res.json({ message: "Ticket status updated and email sent" });
      });
    }
  );
});

// Delete ticket (admin only)
router.delete("/:id", authMiddleware, (req, res) => {
  const ticketId = req.params.id;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  db.query("DELETE FROM tickets WHERE id = ?", [ticketId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Ticket deleted successfully" });
  });
});

module.exports = router;
