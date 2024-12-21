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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
});

// Define the schema for the reviews
const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: String, required: true },
  },
  { timestamps: true }
);

// Define the product schema
const productSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String], required: true },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true }
);

// Create Product model
const Product = mongoose.model("Product", productSchema);

// User schema
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
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many requests in a minute, please try again later.",
});

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(limiter);

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Fetch products route
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Register route with image upload
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

// Adding a new product route (for testing purposes)
app.post("/add-product", async (req, res) => {
  try {
    const { name, category, price, tags, reviews } = req.body;

    // Create a new product instance
    const newProduct = new Product({
      productId: Math.floor(Math.random() * 10000), // Random product ID for testing
      name,
      category,
      price,
      tags,
      reviews,
    });

    // Save the product to the database
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Error adding product" });
  }
});

// Server listener
app.listen(PORT, () => {
  console.log(`The server is running at http://localhost:${PORT}`);
});
