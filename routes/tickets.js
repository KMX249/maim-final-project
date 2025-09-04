import express from 'express';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import { auth, requireRole } from '../middleware/auth.js';
import { generateQR } from '../utils/qr.js';

const router = express.Router();

// Book ticket (simple: auto-assign seat number, decrement seatsAvailable atomically)
router.post('/book', auth, async (req, res) => {
  const { eventId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;
  if (!eventId) return res.status(400).json({ error: 'eventId required' });
  try {
    // Atomically decrement seatsAvailable if enough seats
    const ev = await Event.findOneAndUpdate(
      { _id: eventId, seatsAvailable: { $gte: qty } },
      { $inc: { seatsAvailable: -qty } },
      { new: true }
    );
    if (!ev) return res.status(400).json({ error: 'Not enough seats or event not found' });

    // create tickets
    const tickets = [];
    for (let i=0;i<qty;i++) {
      // seatNumber as (capacity - seatsAvailable) approx, not guaranteed unique across edits but OK for starter
      const seatNumber = ev.capacity - ev.seatsAvailable - i;
      const t = await Ticket.create({
        userId: req.user._id,
        eventId,
        seatNumber,
        pricePaid: ev.price || 0,
      });
      // generate QR (payload will include ticket id and event id)
      const { dataUrl, raw } = await generateQR({ ticketId: t._id.toString(), eventId: eventId.toString(), issuedAt: Date.now() });
      t.qrPayload = raw;
      await t.save();
      tickets.push({ ...t.toObject(), qr: dataUrl });
    }

    res.json({ ok: true, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my tickets
router.get('/me', auth, async (req, res) => {
  try {
    const ts = await Ticket.find({ userId: req.user._id }).populate('eventId');
    // For each ticket, generate the QR code image if qrPayload exists
    const ticketsWithQR = await Promise.all(ts.map(async t => {
      let qr = null;
      if (t.qrPayload) {
        try {
          // If qrPayload is already a dataUrl, use it; else generate from payload
          if (t.qrPayload.startsWith('data:image')) {
            qr = t.qrPayload;
          } else {
            const { dataUrl } = await generateQR(JSON.parse(t.qrPayload).payload || {});
            qr = dataUrl;
          }
        } catch (e) {
          qr = null;
        }
      }
      return { ...t.toObject(), qr };
    }));
    res.json(ticketsWithQR);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get all tickets for an event (with user info)
router.get('/admin/event-tickets/:eventId', auth, requireRole('admin'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const tickets = await Ticket.find({ eventId }).populate('userId');
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
