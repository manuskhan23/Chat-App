# 💬 Chat App

A real-time chat application built with the MERN stack and Socket.io. This app enables users to communicate instantly with features like user authentication, real-time messaging, and a clean, responsive interface.

## ✨ Features

- Real-time messaging with Socket.io
- User authentication and authorization
- Private and group conversations
- Online/offline user status
- Message history persistence
- Responsive and modern UI
- Middleware-based request handling

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.io |
| Auth | JWT, bcrypt |

## 📁 Project Structure

```
Chat-App/
├── Frontend/          # React frontend application
├── controllers/       # Route controller logic
├── db/                # Database connection config
├── middlewares/       # Authentication & request middlewares
├── models/            # Mongoose data models
├── routes/            # API route definitions
├── utils/             # Utility functions
└── index.js           # Server entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/manuskhan23/Chat-App.git
cd Chat-App
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd Frontend
npm install
```

4. Set up environment variables:
```bash
# Create .env in root directory
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Running the Application

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
cd Frontend
npm start
```

## 📸 Preview

> Coming soon

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center"><sub>Built with ❤️ by <a href="https://github.com/manuskhan23">manuskhan23</a></sub></p>