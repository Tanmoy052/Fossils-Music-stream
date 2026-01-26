
# Fossils Music Stream - Local Setup

This project consists of a React frontend and a Node.js/MongoDB backend.

## 1. Prerequisites
- Node.js (v16+)
- MongoDB installed and running

## 2. Backend Setup
1. Create a `backend` folder and copy `server.js` and `models.js` into it.
2. Run `npm init -y`.
3. Install dependencies: `npm install express mongoose cors dotenv`.
4. Update `server.js` with your MongoDB URI.
5. Run `node server.js`.

## 3. Frontend Setup
1. In the root directory, install dependencies: `npm install react react-dom lucide-react tailwindcss`.
2. Update the `api.ts` service to point to `http://localhost:5000/api` instead of mock data.
3. Run `npm start`.

## 4. Sample Data Import
Use the provided `constants.tsx` data to populate your MongoDB collections via a migration script or manual entry.
