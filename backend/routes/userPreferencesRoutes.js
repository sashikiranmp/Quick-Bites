const express = require("express");
const router = express.Router();
const {
  updateThemePreference,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  getThemePreference,
} = require("../controllers/userPreferencesController");

// Theme preference routes
router.get("/:studentId/theme", getThemePreference);
router.put("/:studentId/theme", updateThemePreference);

// Favorites routes
router.get("/:studentId/favorites", getFavorites);
router.post("/:studentId/favorites", addToFavorites);
router.delete("/:studentId/favorites", removeFromFavorites); // Keep the original route structure

module.exports = router;
