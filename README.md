# 📊 Instalytics

 **Instagram Analytics Dashboard**

---

### ✨ Features

- 📈 Track follower growth and engagement  
- 🏆 View post performance metrics  
- 👥 Analyze audience insights  
- ⚡ Real-time data updates with MongoDB caching  
- 🖥️ Responsive dashboard with light/dark mode  
- 📊 Visual reports with charts and graphs  

---

### 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Recharts  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (with caching for API results)  
- **API:** Apify API for Instagram data fetching  
- **Architecture:** MERN stack (MongoDB, Express, React, Node.js)  
---

### 📁 Project Folder Structure

```
Instalytics/
│
├── frontend/                   \# React frontend app
│   ├── public/                 \# Static assets like images, favicon
│   ├── src/                    \# React source files
│   │   ├── components/         \# Reusable UI components
│   │   ├── pages/              \# Page components
│   │   ├── hooks/              \# Custom React hooks
│   │   ├── styles/             \# Tailwind \& custom CSS
│   │   ├── api/                \# API call utilities
│   │   └── main.jsx            \# Entry point
│   ├── .env                   \# Frontend environment variables
│   └── vite.config.js          \# Vite config
│
├── backend/                    \# Express backend server
│   ├── controllers/            \# Route logic controllers
│   ├── models/                 \# Mongoose data models
│   ├── routes/                 \# API route definitions
│   ├── services/               \# Business logic, caching, Apify integration
│   ├── utils/                  \# Utility functions \& middleware
│   ├── .env                   \# Backend environment variables
│   ├── server.js              \# Entry point for Node server
│   └── package.json           \# Backend dependencies
│
└── README.md                   \# Project overview and setup instructions
```

---

### 🚀 Installation

#### Frontend

1. Clone the repository  
```
git clone https://github.com/Nikhil-Dadhich/Instalytics.git
cd Instalytics/frontend
```

2. Install dependencies  
```
npm install
```

3. Create `.env` file  
```
VITE_API_URL=http://localhost:5000/api
```

4. Start development server  
```
npm run dev
```

#### Backend

1. Navigate to backend folder  
```
cd ../backend
```

2. Install dependencies  
```
npm install
```

3. Create `.env` file  
```
PORT=5000
MONGODB_URI=mongo_connect_string
APIFY_API_TOKEN=apify_api_sdhfiifdsjfdjf
NODE_ENV=development
CACHE_DURATION_WEEKS=1
ALLOWED_ORIGINS=http://localhost:5173
```

4. Start server  
```
npm run dev
```

---

### 🗄️ Caching

- All Instagram analytics data fetched from **Apify API** is cached in **MongoDB**.  
- This reduces redundant API calls and improves dashboard performance.  
- Cached data automatically refreshes based on configured cache duration.
