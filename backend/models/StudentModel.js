const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
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
    themePreference: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    favorites: [
      {
        stallId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StallOwner",
        },
        menuItemId: {
          type: String,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    orders: [
      {
        status: {
          type: String,
          default: "pending",
        },
        name: {
          type: String,
        },
        items: [
          {
            item: {
              type: String,
              required: true,
            },
            price: {
              type: Number,
              required: true,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        pickupTime: {
          type: String,
          default: "Not specified",
        },
        paymentStatus: {
          type: String,
          enum: ['pending', 'paid', 'failed'],
          default: 'pending'
        },
        transactionId: {
          type: String,
          default: null
        }
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("student", studentSchema);
module.exports = Student;
