require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventx';

async function main() {
  await mongoose.connect(uri);
  console.log('Connected to DB for seeding');
  await User.deleteMany({});
  await Event.deleteMany({});

  const adminPass = await bcrypt.hash('adminpass', 12);
  const userPass = await bcrypt.hash('userpass', 12);

  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', passwordHash: adminPass, role: 'admin' });
  const user = await User.create({ name: 'User', email: 'user@example.com', passwordHash: userPass, role: 'user' });

  await Event.create({
    title: 'Sample Concert',
    description: 'A cool music event',
    dateStart: new Date(Date.now() + 1000*60*60*24*7),
    dateEnd: new Date(Date.now() + 1000*60*60*24*7 + 1000*60*60*3),
    venue: { name: 'Main Hall' },
    price: 10,
    capacity: 100,
    seatsAvailable: 100,
    createdBy: admin._id
  });

  console.log('Seed done. Admin login: admin@example.com / adminpass  |  User: user@example.com / userpass');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
