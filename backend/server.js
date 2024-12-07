const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 2 * 1024 * 1024 }, // 5 MB limit
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [8, "Password must be at least 8 characters long."],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    ],
  },
  image: {
    type: String, // Base64 encoded image
    required: [true, "Image is required."],
  },
});

const User = mongoose.model("User", userSchema);

const limiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many request in one minute",
});

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(limiter);

app.get("/", (req, res) => {
  res.send("welcome to server");
});

app.post("/register", upload.single("image"), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if an image is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }

    // Convert image file to Base64
    const imagePath = path.join(__dirname, req.file.path);
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

    // Create a new user instance
    const user = new User({
      email,
      password,
      image: imageBase64,
    });

    // Save the user to the database
    await user.save();

    // Clean up the uploaded file
    fs.unlinkSync(imagePath);

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: messages });
    } else if (error.code === 11000) {
      return res.status(400).json({ error: "Email is already in use." });
    }
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`The server is runnig at ${PORT}`);
});
