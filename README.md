# maim-final-project
Overview

EventX Studio is a full-stack event management system built with React (frontend), Node.js/Express (backend), and MongoDB (database). It allows users to browse events, book tickets, view analytics, and manage events through an admin panel.

Features

User authentication (login/register)
Browse events (upcoming, active, closed)
Event details (description, price, seats, popularity)
Book tickets (seat selection, simulated payment)
View my tickets (QR code for entry)
Notifications for upcoming events
Admin panel (event CRUD, analytics, ticket management)
Analytics charts (age, gender, interests, location)
Ticket management (allocate seats, generate QR codes)
Tech Stack

Frontend: React, Vite, Tailwind CSS, Chart.js
Backend: Node.js, Express, MongoDB, JWT
Database: MongoDB Atlas


Setup Instructions

Clone the repository
git clone : https://github.com/KMX249/maim-final-project cd eventx-studio-starter

Install dependencies
Backend: cd api npm install

Frontend: cd ../web npm install

Configure environment variables
Backend: In api/.env, set your MongoDB Atlas URI: MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

Frontend: In web/.env, set API base URL: VITE_API_BASE=https://your-backend-url/api

Run the app locally
Backend: npm run dev

Frontend: npm run dev

Sample Data

The MongoDB Atlas database is pre-populated with sample users and events.
Connection string: mongodb+srv://instructor:1223334444@cluster0.whpbvkz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
API Endpoints

/api/events - List events
/api/events/:id - Event details
/api/tickets/book - Book tickets
/api/tickets/me - My tickets
/api/analytics/summary - Analytics summary
/api/auth/login - Login
/api/auth/register - Register
Deployment (Live Demo)

Student: Khalid Mohamed
