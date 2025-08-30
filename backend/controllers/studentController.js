const Student = require('../models/StudentModel');

// Register a new student
const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the email is already registered
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create a new student
    const newStudent = new Student({ name, email, password });
    await newStudent.save();

    return res.status(201).json({
      message: "Student registered successfully",
      student: newStudent,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error registering student", error: error.message });
  }
};

const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the password matches
    if (student.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({ message: "Login successful", student });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the student by ID
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ student });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching student", error: error.message });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { studentID, name, items, pickupTime, paymentStatus, transactionId } = req.body;

    console.log("Received order request:", {
      studentID,
      name,
      items,
      pickupTime,
      paymentStatus,
      transactionId
    });

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and cannot be empty.",
      });
    }

    const student = await Student.findById(studentID);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    // Create a new order object with the name and items
    const newOrder = {
      name: name,
      items: items,
      status: "pending",
      createdAt: new Date(),
      pickupTime: pickupTime || "Not specified",
      paymentStatus: paymentStatus || 'pending',
      transactionId: transactionId || null
    };

    console.log("Creating new order:", newOrder);

    // Push the new order to the orders array
    student.orders.push(newOrder);

    // Save the updated student document
    await student.save();

    console.log("Order saved successfully");

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the student by ID
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Create a copy of orders array and sort by createdAt in descending order (newest first)
    const sortedOrders = [...student.orders].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    // Return the sorted orders array with success flag
    return res.status(200).json({
      success: true,
      data: sortedOrders || [],
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching order history",
      error: error.message,
    });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  getSingleUser,
  placeOrder,
  getOrderHistory,
};
