const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

// Private routes (require valid JWT)
router.get("/profile", protect, authController.getUserProfile);

module.exports = router;
