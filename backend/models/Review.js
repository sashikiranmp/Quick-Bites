const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    stallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StallOwner",
      required: true,
    },
    menuItemId: {
      type: String, // Reference to the menu item name
      required: false,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String, // URLs to review images
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
