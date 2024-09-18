require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./Db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

// database connection
connection();

// middlewares
app.use(express.json());
const corsOptions = {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true // If you need to allow cookies/auth headers
  };
  
  app.use(cors(corsOptions));
  

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

const port = process.env.PORT || 8050;
app.listen(port, console.log(`Listening on port ${port}...`));