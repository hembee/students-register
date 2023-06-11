const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const Admin = require("./admin.model");
const Student = require("./student.model");
const { adminValidator } = require("./validator");
const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1/register")
  .then(() => {
    console.log("Database connection is established");
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route for handling the public-side HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Controller for signup
app.post("/signup", async (req, res) => {
  try {
    const { error } = adminValidator.validate(req.body);
    if (error) throw error;
    const { username, password } = req.body;

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        message: "An account with this username already exists",
      });
    }

    // Create a new admin
    const newAdmin = await Admin.create({ username, password });

    res.status(201).json({
      status: "Success",
      message: "User signup successful",
      data: {
        admin: newAdmin,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Controller for login
app.post("/admin/login", async (req, res) => {
  const { error } = adminValidator.validate(req.body);
  if (error) throw error;
  try {
    const { username, password } = req.body;

    // Check if the username and password are correct
    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Login successful",
      data: {
        admin,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// controller for student form
app.post("/student", async (req, res) => {
  try {
    const { name, studentId, signInTime } = req.body;
    const student = await Student.create({
      name: name,
      studentID: studentId,
      signInTime: signInTime,
    });

    if (!student) {
      return res.status(400).json({
        status: "Error",
        message: "Failed to create student record",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Student record created successfully",
      data: {
        student,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});
// get students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.render("students", { students });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch student records",
    });
  }
});

// set signout time
app.post("/students/signout", async (req, res) => {
  try {
    const { studentID } = req.body;

    const currentTime = new Date().toLocaleTimeString();
    const updatedStudent = await Student.updateOne(
      { studentID },
      { $set: { signOutTime: currentTime } }
    );

    if (updatedStudent.nModified === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }
    res.redirect("/students");
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
