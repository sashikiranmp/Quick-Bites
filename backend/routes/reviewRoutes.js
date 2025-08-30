const express = require("express");
const router = express.Router();
const {
  createReview,
  getStallReviews,
  getMenuItemReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

// Create a new review
router.post("/", createReview);

// Get all reviews for a stall
router.get("/stall/:stallId", getStallReviews);

// Get all reviews for a specific menu item
router.get("/stall/:stallId/menu-item/:menuItemId", getMenuItemReviews);

// Update a review
router.put("/:reviewId", updateReview);

// Delete a review
router.delete("/:reviewId", deleteReview);

module.exports = router;
