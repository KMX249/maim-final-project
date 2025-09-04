
import express from 'express';
import { verifyQR } from '../utils/qr.js';
import Ticket from '../models/Ticket.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Check-in using raw QR string (admin/scanner)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  const { qrString } = req.body;
  if (!qrString) {
    return res.status(400).json({ error: 'qrString required' });
  }

  const result = verifyQR(qrString);
  if (!result.valid) {
    return res.status(400).json({ error: 'Invalid QR' });
  }

  const { ticketId } = result.payload;
  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'checked_in') {
      return res.json({ ok: true, message: 'Already checked in' });
    }

    ticket.status = 'checked_in';
    await ticket.save();

    res.json({ ok: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;