const Student = require("../models/StudentModel");
const Stall = require("../models/Stall");
const SimpleStall = require("../models/SimpleStall");

// Get theme preference
exports.getThemePreference = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        themePreference: student.themePreference,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update theme preference
exports.updateThemePreference = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { themePreference } = req.body;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { themePreference },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Add item to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { stallId, menuItemId } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // Check if the stall exists in either Stall or SimpleStall model
    let stall = await Stall.findById(stallId);
    if (!stall) {
      stall = await SimpleStall.findById(stallId);
    }

    if (!stall) {
      return res.status(404).json({
        success: false,
        error: "Stall not found",
      });
    }

    // Special handling for "all" menuItemId - check if stall is already favorited
    if (menuItemId === "all") {
      const isStallAlreadyFavorite = student.favorites.some(
        (fav) => fav.stallId.toString() === stallId && fav.menuItemId === "all"
      );

      if (isStallAlreadyFavorite) {
        return res.status(400).json({
          success: false,
          error: "Stall is already in favorites",
        });
      }
    } else {
      // Check if specific item is already in favorites
      const isAlreadyFavorite = student.favorites.some(
        (fav) =>
          fav.stallId.toString() === stallId && fav.menuItemId === menuItemId
      );

      if (isAlreadyFavorite) {
        return res.status(400).json({
          success: false,
          error: "Item is already in favorites",
        });
      }
    }

    student.favorites.push({ stallId, menuItemId });
    await student.save();

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Remove item from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { stallId, menuItemId } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // If menuItemId is "all", remove all favorites for this stall
    if (menuItemId === "all") {
      student.favorites = student.favorites.filter(
        (fav) => fav.stallId.toString() !== stallId
      );
    } else {
      student.favorites = student.favorites.filter(
        (fav) =>
          !(fav.stallId.toString() === stallId && fav.menuItemId === menuItemId)
      );
    }

    await student.save();

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all favorites
exports.getFavorites = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // Populate favorites with stall details from both models
    const populatedFavorites = await Promise.all(
      student.favorites.map(async (favorite) => {
        let stall = await Stall.findById(favorite.stallId).select("name menu");
        if (!stall) {
          stall = await SimpleStall.findById(favorite.stallId).select("name menu");
        }
        return {
          ...favorite.toObject(),
          stallId: stall || favorite.stallId, // Keep original ID if stall not found
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedFavorites,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
