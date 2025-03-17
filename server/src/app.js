import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 

dotenv.config();

import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import scooterRoutes from "./routes/scooter.routes.js"
import rentalRoutes from "./routes/rental.routes.js"
import transactionRoutes from "./routes/transaction.routes.js";
import revenueRoutes from "./routes/revenue.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import chatRoutes from "./routes/chat.routes.js"
import adminRoutes from "./routes/admin.routes.js"
const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"], 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/scooter", scooterRoutes);
app.use("/api/rental", rentalRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin/dashboard", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to EVAdmin API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

export default app;