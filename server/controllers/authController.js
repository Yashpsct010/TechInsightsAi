const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_fallback_secret", {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email, explicitly select password since it's normally hidden
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
};

/**
 * @desc    Get user profile (currently logged in user based on token)
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set in the authMiddleware
    const user = await User.findById(req.user._id).populate("bookmarks");

    if (user) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        bookmarks: user.bookmarks,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

/**
 * @desc    Update user preferences
 * @route   PUT /api/auth/preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    // Validate that preferences is an array
    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: "Preferences must be an array" });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.preferences = preferences;
      const updatedUser = await user.save();

      res.json({
        message: "Preferences updated successfully",
        preferences: updatedUser.preferences,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Server error updating preferences" });
  }
};

/**
 * @desc    Toggle bookmark for a specific blog
 * @route   PUT /api/auth/bookmarks
 * @access  Private
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const { blogId } = req.body;

    if (!blogId) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      // Check if bookmark already exists
      const isBookmarked = user.bookmarks.some(
        (id) => id.toString() === blogId,
      );

      if (isBookmarked) {
        // Remove bookmark
        user.bookmarks = user.bookmarks.filter(
          (id) => id.toString() !== blogId,
        );
      } else {
        // Add bookmark
        user.bookmarks.push(blogId);
      }

      const updatedUser = await user.save();

      res.json({
        message: isBookmarked ? "Bookmark removed" : "Bookmark added",
        bookmarks: updatedUser.bookmarks,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ message: "Server error toggling bookmark" });
  }
};

/**
 * @desc    Get user's bookmarked blogs
 * @route   GET /api/auth/bookmarks
 * @access  Private
 */
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      select: "title image imageAlt genre createdAt",
    });

    if (user) {
      res.json(user.bookmarks);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ message: "Server error fetching bookmarks" });
  }
};
