
import express from 'express';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const ticketsSold = await Ticket.countDocuments({
      status: { $in: ['paid', 'checked_in'] }
    });

    const revenueAgg = await Ticket.aggregate([
      { $match: { status: { $in: ['paid', 'checked_in'] } } },
      { $group: { _id: null, total: { $sum: '$pricePaid' } } }
    ]);
    const revenue = (revenueAgg[0] && revenueAgg[0].total) || 0;

    // Attendee insights
    // Get all users who have tickets
    const userIds = await Ticket.distinct('userId', { status: { $in: ['paid', 'checked_in'] } });
    const users = await (await import('../models/User.js')).default.find({ _id: { $in: userIds } });

    // Age breakdown
    const ageGroups = { '<18': 0, '18-25': 0, '26-35': 0, '36-50': 0, '51+': 0 };
    // Gender breakdown
    const genderGroups = { male: 0, female: 0, other: 0 };
    // Interests breakdown
    const interestsCount = {};
    // Location breakdown
    const locationCount = {};

    users.forEach(u => {
      const age = u.profile?.age;
      if (typeof age === 'number') {
        if (age < 18) ageGroups['<18']++;
        else if (age <= 25) ageGroups['18-25']++;
        else if (age <= 35) ageGroups['26-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else ageGroups['51+']++;
      }
      const gender = (u.profile?.gender || '').toLowerCase();
      if (genderGroups.hasOwnProperty(gender)) genderGroups[gender]++;
      else genderGroups['other']++;
      if (Array.isArray(u.profile?.interests)) {
        u.profile.interests.forEach(i => {
          if (!i) return;
          interestsCount[i] = (interestsCount[i] || 0) + 1;
        });
      }
      const loc = u.profile?.location;
      if (loc) locationCount[loc] = (locationCount[loc] || 0) + 1;
    });

    res.json({
      totalEvents,
      ticketsSold,
      revenue,
      attendeeInsights: {
        ageGroups,
        genderGroups,
        interestsCount,
        locationCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;