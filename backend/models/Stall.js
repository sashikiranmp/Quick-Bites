const mongoose = require("mongoose");

const stallSchema = new mongoose.Schema(
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
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    menu: [
      {
        name: {
          type: String,
          required: false,
        },
        price: {
          type: Number,
          required: false,
        },
        description: {
          type: String,
          required: false,
        },
        category: {
          type: String,
          required: false,
        },
        image: {
          type: String,
        },
        averageRating: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        totalReviews: {
          type: Number,
          default: 0,
        },
        isAvailable: {
          type: Boolean,
          default: true,
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
      },
    ],
    orders: [
      {
        name: {
          type: String,
          required: false,
        },
        studentID: {
          type: String,
        },
        time: {
          type: String,
        },
        items: [
          {
            item: {
              type: String,
              required: false,
            },
            price: {
              type: Number,
              required: false,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Stall = mongoose.model("StallOwner", stallSchema);
module.exports = Stall;
