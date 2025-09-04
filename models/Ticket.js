import mongoose from 'mongoose';
const TicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  seatNumber: Number,
  pricePaid: Number,
  status: { type: String, enum: ['reserved','paid','cancelled','checked_in'], default: 'paid' },
  qrPayload: String
}, { timestamps: true });

TicketSchema.index({ eventId: 1, seatNumber: 1 }, { unique: false });

const Ticket = mongoose.model('Ticket', TicketSchema);
export default Ticket;
