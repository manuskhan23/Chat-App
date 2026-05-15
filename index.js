import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import AuthRoutes from './routes/Auth.js';
import DbCon from './db/db.js';
import MessageRoutes from './routes/Messages.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development'; // Default to 'development'
const app = express();

// db connection 
DbCon().catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});

app.use(express.json());
app.use(cors({
  origin: ["https://chat-app-baem.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', AuthRoutes);
app.use('/api/messages', MessageRoutes);

// GLOBAL API 404 HANDLER
// Use app.all and a simple prefix to catch everything starting with /api
app.all('/api/*', (req, res) => {
  console.log(`[404] Unmatched API Request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: `API Route ${req.originalUrl} not found.` });
});

if (NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, './Frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './Frontend/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Create HTTP Server
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*', // Update with your frontend domain for production
    methods: ['GET', 'POST'],
  },
});

// Use a Map for O(1) lookups instead of an array
const users = new Map();

io.on('connection', (socket) => {
  // when connected
  console.log('a user connected', socket.id);

  socket.on('AddUserSocket', (userId) => {
    users.set(userId, socket.id);
    // Convert Map to array of objects for frontend compatibility
    const usersArray = Array.from(users, ([userId, socketId]) => ({ userId, socketId }));
    io.emit('getUsers', usersArray);
  });

  // message
  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, message } = data.messagedata;
    const receiverSocketId = users.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        userId: senderId,
        message,
      });
    }
  });

  // when desction
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    // Find and remove the user by socketId
    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
    const usersArray = Array.from(users, ([userId, socketId]) => ({ userId, socketId }));
    io.emit('getUsers', usersArray);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
