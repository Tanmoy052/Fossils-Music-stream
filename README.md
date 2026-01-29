# 🎵 Fossils Music Stream

A full‑stack music streaming web application inspired by the legendary Bengali rock band **Fossils**.

This project includes:

* **Frontend**: React + Vite + Tailwind CSS
* **Backend**: Node.js + Express
* **Database**: MongoDB

---

## ✨ Features

* 🎧 Music browsing & playback UI
* 📀 Discography and albums
* 📝 Lyrics display
* 🎨 Custom Tailwind-based theme
* 🔌 REST API backend

---

## 🧱 Tech Stack

### Frontend

* React (with Vite)
* Tailwind CSS
* Lucide Icons

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

---

## 📋 Prerequisites

Make sure you have the following installed:

* **Node.js** v16 or later
* **MongoDB** (local or Atlas)
* **Git**

---

## 📁 Project Structure

```
fossils-music-stream/
│
├── backend/
│   ├── server.js
│   ├── models.js
│   ├── data/
│   └── package.json
│
├── src/
│   ├── components/
│   ├── services/
│   ├── content/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## ⚙️ Backend Setup

### 1️⃣ Go to backend folder

```bash
cd backend
```

### 2️⃣ Install backend dependencies

```bash
npm install express mongoose cors dotenv
```

### 3️⃣ Create `.env` file

Create a file named `.env` inside `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/fossils_music
PORT=5000
```

### 4️⃣ Start backend server

```bash
node server.js
```

Backend will run at:

```
http://localhost:5000
```

---

## 🎨 Frontend Setup

### 1️⃣ Install frontend dependencies

From the **project root**:

```bash
npm install
```

### 2️⃣ Tailwind setup (already included)

Ensure `src/index.css` contains:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3️⃣ Configure API URL

Edit:

```
src/services/api.ts
```

Set the base URL to:

```ts
http://localhost:5000/api
```

### 4️⃣ Run frontend

```bash
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

## 🧪 Sample Data

Sample content is available in:

```
constants.tsx
```

You can:

* Manually insert it using **MongoDB Compass**
* OR create a seed/migration script

---

## 🚀 Deployment

### Frontend

* **Vercel** (recommended)

### Backend

* **Render**, **Railway**, or **Cyclic**

### Database

* **MongoDB Atlas**

---

## 🛡️ Environment Variables (Production)

### Backend

```env
MONGODB_URI=<your_mongodb_atlas_uri>
PORT=5000
```

---

## 🤝 Contributing

Pull requests are welcome.
For major changes, please open an issue first.

---

## 📜 License

This project is for **educational and fan‑based purposes only**.

---

## 🙌 Acknowledgements

* Fossils (band)
* React
* Tailwind CSS
* MongoDB

---

🎶 *Keep rocking!*
