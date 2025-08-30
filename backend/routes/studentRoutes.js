const express = require("express");
const {
  registerStudent,
  loginStudent,
  getSingleUser,
  placeOrder,
  getOrderHistory,
} = require("../controllers/studentController");

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/order", placeOrder);
router.get("/order/:id", getOrderHistory);
router.get("/:id", getSingleUser);

module.exports = router;
