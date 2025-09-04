
import express from 'express';
import Event from '../models/Event.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public: list events
// Only import Ticket once at the top

router.get('/', async (req, res) => {
  const q = req.query.q || '';
  const filter = { title: new RegExp(q, 'i'), status: 'published' };

  try {
    const events = await Event.find(filter)
      .limit(100)
      .sort({ dateStart: 1 });

    // For each event, add popularity (number of tickets booked)
    const eventsWithPopularity = await Promise.all(events.map(async ev => {
      const popularity = await Ticket.countDocuments({ eventId: ev._id });
      const evObj = ev.toObject();
      evObj.popularity = popularity;
      return evObj;
    }));

    res.json(eventsWithPopularity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: get single event
import Ticket from '../models/Ticket.js';

router.get('/:id', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Calculate popularity (number of tickets booked for this event)
    const popularity = await Ticket.countDocuments({ eventId: ev._id });
    const evObj = ev.toObject();
    evObj.popularity = popularity;
    res.json(evObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin creates event
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const data = req.body;
    data.seatsAvailable = data.capacity || 100;
    const ev = await Event.create({ ...data, createdBy: req.user._id });
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin updates event
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin deletes event
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;