const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "Other",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  nutritionInfo: {
    calories: {
      type: Number,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
  },
  customizationOptions: [
    {
      name: String,
      options: [String],
      price: Number,
    },
  ],
});

const simpleStallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    cuisineType: {
      type: String,
      enum: ["Indian", "Chinese", "Fast Food", "Other"],
      default: "Other",
    },
    menu: [menuItemSchema],
    orders: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const SimpleStall = mongoose.model("SimpleStallOwner", simpleStallSchema);
module.exports = SimpleStall;
