<div align="center">
  <h1>🚀 Coding Platform</h1>
  <p><b>A full-stack platform for programming contests, problems, submissions, blogs, and analytics.</b></p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-16%2B-brightgreen?logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-Backend-blue?logo=express" alt="Express.js" />
    <img src="https://img.shields.io/badge/React-Frontend-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql" alt="MySQL" />
    <img src="https://img.shields.io/badge/Vite-Build-646CFF?logo=vite" alt="Vite" />
  </p>
</div>

---

## ✨ Features

🌟 User authentication and profile management  
🏆 Contest creation and management (admin & faculty)  
📝 Problem set and problem details  
💻 Code submission and compilation  
📊 Leaderboards and analytics  
📰 Blog creation and listing  
💬 Feedback system

---

## 📁 Folder Structure

```text
backend/           # Node.js/Express backend
  controllers/     # API controllers
  models/          # Database models
  routes/          # API routes
  middleware/      # Auth and other middleware
  config/          # DB and config files
  schema.sql       # SQL schema
  server.js        # Entry point
frontend/          # React frontend (Vite)
  src/             # Source code
    components/    # React components
    pages/         # Page components
    context/       # React context
    styles/        # CSS styles
  public/          # Static assets
  index.html       # Main HTML file
```

---

## ⚡ Installation

### 🔧 Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MySQL or compatible SQL database

### 🛠️ Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure your database in `config/db.js` and run the SQL schema in `schema.sql`.
4. Start the backend server:
   ```sh
   node server.js
   ```

### 🖥️ Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```

---

## 🚦 Usage

- Access the frontend at [`http://localhost:5173`](http://localhost:5173) (default Vite port).
- The backend runs on [`http://localhost:3000`](http://localhost:3000) (default Express port).
- Register/login, participate in contests, submit code, view leaderboards, and more.

---

## 🛠️ Technologies Used

| Frontend | Backend | Database |
|----------|---------|----------|
| <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" /> | <img src="https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white" /> <br> <img src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white" /> | <img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white" /> |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 📬 Contact

For questions or support, contact the maintainers via email or open an issue.
