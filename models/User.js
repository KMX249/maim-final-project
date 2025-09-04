import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  profile: {
    age: Number,
    gender: String,
    interests: [String],
    location: String
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;
