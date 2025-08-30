const express = require("express");
const {
  registerStall,
  loginStall,
  getAllStalls,
  getSingleStall,
  createMenu,
  placeOrder,
  removeOrder,
  updateMenuItem,
  deleteMenuItem,
  getStallOrders,
} = require("../controllers/stallController");

const router = express.Router();

// Authentication routes
router.post("/register", registerStall);
router.post("/login", loginStall);

// Menu routes
router.post("/menu", createMenu);
router.put("/menu/:stallId/:itemId", updateMenuItem);
router.delete("/menu/:stallId/:itemId", deleteMenuItem);

// Order routes
router.post("/order", placeOrder);
router.post("/deleteOrder", removeOrder);

// Stall routes - specific routes first
router.get("/:id/orders", getStallOrders);
router.get("/:id", getSingleStall);

// General routes last
router.get("/", getAllStalls);

module.exports = router;
