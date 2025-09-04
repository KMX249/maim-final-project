import mongoose from 'mongoose';
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  coverImage: String,
  category: String,
  venue: { name: String, address: String, mapUrl: String },
  dateStart: Date,
  dateEnd: Date,
  status: { type: String, enum: ['draft','published','closed'], default: 'published' },
  price: { type: Number, default: 0 },
  capacity: { type: Number, default: 100 },
  seatsAvailable: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  popularity: { type: Number, default: 0 } // Number of tickets booked
}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);
export default Event;
