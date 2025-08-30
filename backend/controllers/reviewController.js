const Review = require("../models/Review");
const Stall = require("../models/Stall");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { studentId, stallId, menuItemId, rating, review, images } = req.body;

    // Create the review
    const newReview = await Review.create({
      studentId,
      stallId,
      menuItemId,
      rating,
      review,
      images,
    });

    // Update stall's average rating and total reviews
    const stall = await Stall.findById(stallId);
    const allReviews = await Review.find({ stallId });

    const totalRating = allReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    stall.averageRating = totalRating / allReviews.length;
    stall.totalReviews = allReviews.length;
    await stall.save();

    // If review is for a specific menu item, update its ratings
    if (menuItemId) {
      const menuItem = stall.menu.find((item) => item.name === menuItemId);
      if (menuItem) {
        const itemReviews = await Review.find({ stallId, menuItemId });
        const itemTotalRating = itemReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        menuItem.averageRating = itemTotalRating / itemReviews.length;
        menuItem.totalReviews = itemReviews.length;
        await stall.save();
      }
    }

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get reviews for a stall
exports.getStallReviews = async (req, res) => {
  try {
    const { stallId } = req.params;
    const reviews = await Review.find({ stallId })
      .populate("studentId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get reviews for a specific menu item
exports.getMenuItemReviews = async (req, res) => {
  try {
    const { stallId, menuItemId } = req.params;
    const reviews = await Review.find({ stallId, menuItemId })
      .populate("studentId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review, images } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, review, images },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
